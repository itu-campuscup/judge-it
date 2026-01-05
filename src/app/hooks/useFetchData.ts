import { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import {
  HEATS_TABLE,
  PLAYERS_TABLE,
  TEAMS_TABLE,
  TIME_LOGS_TABLE,
  TIME_TYPES_TABLE,
} from "@/utils/constants";
import type {
  Player,
  Heat,
  Team,
  TimeType,
  TimeLog,
  AlertContext,
} from "@/types";
import {
  createLogger,
  Result,
  ok,
  err,
  AppError,
  wrapError,
} from "@/observability";
import { useAuth } from "@/AuthContext";

interface UseFetchDataReturn {
  players: Player[];
  heats: Heat[];
  teams: Team[];
  timeTypes: TimeType[];
  timeLogs: TimeLog[];
  alert: {
    open: boolean;
    severity: "error" | "success" | "info" | "warning";
    text: string;
    context?: AlertContext;
    setOpen: (open: boolean) => void;
    setSeverity: (severity: "error" | "success" | "info" | "warning") => void;
    setText: (text: string) => void;
    setContext: (context: AlertContext | undefined) => void;
  };
}

/**
 * Hook to fetch data from db and listen for changes
 * This is a primary endpoint - logs centrally at this level
 * @returns {UseFetchDataReturn} players, heats, teams, timeTypes, timeLogs, and alert object
 */
export const useFetchData = (): UseFetchDataReturn => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [heats, setHeats] = useState<Heat[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [timeTypes, setTimeTypes] = useState<TimeType[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<
    "error" | "success" | "info" | "warning"
  >("error");
  const [alertText, setAlertText] = useState<string>("");
  const [alertContext, setAlertContext] = useState<AlertContext | undefined>();

  // Create logger for this endpoint
  const logger = createLogger("useFetchData", user);

  useEffect(() => {
    // Helper to fetch data and return Result
    const fetchTable = async <T>(
      tableName: string,
      setter: (data: T[]) => void
    ): Promise<Result<T[], Error>> => {
      try {
        const { data, error } = await supabase.from(tableName).select("*");
        if (error) {
          return err(
            new AppError(
              `Failed to fetch ${tableName}`,
              "FETCH_ERROR",
              { table: tableName, error: error.message },
              undefined,
              `fetchTable(${tableName})` // Location for error chain
            )
          );
        }
        setter(data || []);
        return ok(data || []);
      } catch (error) {
        return err(
          wrapError(
            error instanceof Error
              ? error
              : new Error(`Unknown error fetching ${tableName}`),
            `Exception in fetchTable`,
            "FETCH_EXCEPTION",
            `fetchTable(${tableName})`,
            { table: tableName }
          )
        );
      }
    };

    const fetchTimeLogs = async (): Promise<Result<TimeLog[], Error>> => {
      return fetchTable<TimeLog>(TIME_LOGS_TABLE, setTimeLogs);
    };

    const fetchPlayers = async (): Promise<Result<Player[], Error>> => {
      return fetchTable<Player>(PLAYERS_TABLE, setPlayers);
    };

    const fetchHeats = async (): Promise<Result<Heat[], Error>> => {
      return fetchTable<Heat>(HEATS_TABLE, setHeats);
    };

    const fetchTeams = async (): Promise<Result<Team[], Error>> => {
      return fetchTable<Team>(TEAMS_TABLE, setTeams);
    };

    const fetchTimeTypes = async (): Promise<Result<TimeType[], Error>> => {
      return fetchTable<TimeType>(TIME_TYPES_TABLE, setTimeTypes);
    };

    // Initial fetch - using Promise.all for parallel execution
    const fetchAllData = async () => {
      const results = await Promise.allSettled([
        fetchTimeLogs(),
        fetchPlayers(),
        fetchHeats(),
        fetchTeams(),
        fetchTimeTypes(),
      ]);

      // Aggregate errors and successes
      const errors: AppError[] = [];
      const successes: string[] = [];
      const tableNames = [
        "time_logs",
        "players",
        "heats",
        "teams",
        "time_types",
      ];

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && !result.value.success) {
          errors.push(result.value.error as AppError);
        } else if (result.status === "fulfilled") {
          successes.push(tableNames[index]);
        } else if (result.status === "rejected") {
          errors.push(
            new AppError(
              `Failed to fetch ${tableNames[index]}`,
              "FETCH_REJECTED",
              { error: result.reason },
              result.reason instanceof Error ? result.reason : undefined,
              `fetchAllData.${tableNames[index]}`
            )
          );
        }
      });

      // Log at endpoint level
      if (errors.length > 0) {
        logger.error("initial_fetch", errors[0], {
          failedTables: errors.map((e) => e.context?.table),
          successfulTables: successes,
          totalErrors: errors.length,
        });
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(`Failed to fetch ${errors.length} table(s)`);
      } else {
        logger.info("initial_fetch", {
          tables: successes,
          recordCounts: {
            players: players.length,
            heats: heats.length,
            teams: teams.length,
            timeTypes: timeTypes.length,
            timeLogs: timeLogs.length,
          },
        });
      }
    };

    fetchAllData();

    // Set up a single multiplexed channel for all real-time updates
    let channel: any = null;

    const setupListeners = async () => {
      try {
        // Use a single channel with multiple listeners for better performance
        channel = supabase
          .channel("db-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: TIME_LOGS_TABLE },
            async (payload) => {
              const result = await fetchTimeLogs();
              if (!result.success) {
                logger.error("realtime_update", result.error, {
                  table: TIME_LOGS_TABLE,
                  eventType: payload.eventType,
                });
              } else {
                logger.debug("realtime_update", {
                  table: TIME_LOGS_TABLE,
                  eventType: payload.eventType,
                  recordsCount: result.value.length,
                });
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: PLAYERS_TABLE },
            async (payload) => {
              const result = await fetchPlayers();
              if (!result.success) {
                logger.error("realtime_update", result.error, {
                  table: PLAYERS_TABLE,
                  eventType: payload.eventType,
                });
              } else {
                logger.debug("realtime_update", {
                  table: PLAYERS_TABLE,
                  eventType: payload.eventType,
                });
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: HEATS_TABLE },
            async (payload) => {
              const result = await fetchHeats();
              if (!result.success) {
                logger.error("realtime_update", result.error, {
                  table: HEATS_TABLE,
                  eventType: payload.eventType,
                });
              } else {
                logger.debug("realtime_update", {
                  table: HEATS_TABLE,
                  eventType: payload.eventType,
                });
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: TEAMS_TABLE },
            async (payload) => {
              const result = await fetchTeams();
              if (!result.success) {
                logger.error("realtime_update", result.error, {
                  table: TEAMS_TABLE,
                  eventType: payload.eventType,
                });
              } else {
                logger.debug("realtime_update", {
                  table: TEAMS_TABLE,
                  eventType: payload.eventType,
                });
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: TIME_TYPES_TABLE },
            async (payload) => {
              const result = await fetchTimeTypes();
              if (!result.success) {
                logger.error("realtime_update", result.error, {
                  table: TIME_TYPES_TABLE,
                  eventType: payload.eventType,
                });
              } else {
                logger.debug("realtime_update", {
                  table: TIME_TYPES_TABLE,
                  eventType: payload.eventType,
                });
              }
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              logger.info("realtime_subscribed", {
                channel: "db-changes",
                tables: [
                  TIME_LOGS_TABLE,
                  PLAYERS_TABLE,
                  HEATS_TABLE,
                  TEAMS_TABLE,
                  TIME_TYPES_TABLE,
                ],
              });
            } else if (status === "CHANNEL_ERROR") {
              logger.error(
                "realtime_subscription",
                new AppError("Real-time subscription error", "REALTIME_ERROR")
              );
              setAlertOpen(true);
              setAlertSeverity("warning");
              setAlertText("Real-time updates may be unavailable");
            } else if (status === "TIMED_OUT") {
              logger.error(
                "realtime_subscription",
                new AppError(
                  "Real-time subscription timed out",
                  "REALTIME_TIMEOUT"
                )
              );
            }
          });
      } catch (error) {
        const appError =
          error instanceof Error
            ? new AppError(
                "Failed to setup realtime listeners",
                "SETUP_ERROR",
                {
                  originalError: error.message,
                },
                error,
                "setupListeners"
              )
            : new AppError(
                "Unknown setup error",
                "SETUP_ERROR",
                undefined,
                undefined,
                "setupListeners"
              );

        logger.error("setup_listeners", appError);
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText("Failed to setup real-time updates");
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        logger.info("cleanup", {
          message: "Real-time subscriptions cleaned up",
        });
      }
    };
  }, [user]); // Add user dependency

  return {
    players,
    heats,
    teams,
    timeTypes,
    timeLogs,
    alert: {
      open: alertOpen,
      severity: alertSeverity,
      text: alertText,
      context: alertContext,
      setOpen: setAlertOpen,
      setSeverity: setAlertSeverity,
      setText: setAlertText,
      setContext: setAlertContext,
    },
  };
};

export default useFetchData;
