"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type {
  Player,
  Heat,
  Team,
  TimeType,
  TimeLog,
  AlertContext,
} from "@/types";
import { createLogger } from "@/observability";
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
  loading: boolean;
  error: string | null;
  reload: () => void;
  lastReloaded: number;
}

/**
 * Hook to fetch data from Convex and listen for real-time changes
 * This replaces the Supabase useFetchData hook with Convex queries
 *
 * @returns {UseFetchDataReturn} players, heats, teams, timeTypes, timeLogs, alert, loading, and error
 */
export const useFetchDataConvex = (): UseFetchDataReturn => {
  const { user } = useAuth();
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<
    "error" | "success" | "info" | "warning"
  >("error");
  const [alertText, setAlertText] = useState<string>("");
  const [alertContext, setAlertContext] = useState<AlertContext | undefined>();
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [lastReloaded, setLastReloaded] = useState<number>(Date.now());

  // Create logger for this endpoint
  const logger = useMemo(() => createLogger("useFetchDataConvex"), []);

  // Update logger's user context when user changes
  useEffect(() => {
    logger.setUser(user);
  }, [user, logger]);

  // Reload function to force refetch
  const reload = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
    setLastReloaded(Date.now());
    logger.info("Manual data reload triggered");
  }, [logger]);

  // Memoize alert object to prevent recreation on every render
  const alert = useMemo(
    () => ({
      open: alertOpen,
      severity: alertSeverity,
      text: alertText,
      context: alertContext,
      setOpen: setAlertOpen,
      setSeverity: setAlertSeverity,
      setText: setAlertText,
      setContext: setAlertContext,
    }),
    [alertOpen, alertSeverity, alertText, alertContext],
  );

  // Fetch all data using Convex queries - these automatically subscribe to changes
  // The reloadTrigger dependency forces a re-subscription when reload is called
  const convexPlayers = useQuery(
    api.queries.getPlayers,
    reloadTrigger >= 0 ? {} : "skip",
  );
  const convexHeats = useQuery(
    api.queries.getHeats,
    reloadTrigger >= 0 ? {} : "skip",
  );
  const convexTeams = useQuery(
    api.queries.getTeams,
    reloadTrigger >= 0 ? {} : "skip",
  );
  const convexTimeTypes = useQuery(
    api.queries.getTimeTypes,
    reloadTrigger >= 0 ? {} : "skip",
  );
  const convexTimeLogs = useQuery(
    api.queries.getTimeLogs,
    reloadTrigger >= 0 ? {} : "skip",
  );

  // Convert Convex data to match existing interfaces
  // Memoize to prevent unnecessary re-mapping and re-renders when data hasn't changed
  const players: Player[] = useMemo(
    () =>
      convexPlayers?.map((p) => ({
        id: p._id,
        name: p.name,
        image_url: p.image_url,
        fun_fact: p.fun_fact,
        created_at: p._creationTime
          ? new Date(p._creationTime).toISOString()
          : undefined,
      })) ?? [],
    [convexPlayers],
  );

  const heats: Heat[] = useMemo(
    () =>
      convexHeats?.map((h) => ({
        id: h._id,
        name: h.name,
        heat: h.heat,
        date: h.date,
        is_current: h.is_current,
        created_at: h._creationTime
          ? new Date(h._creationTime).toISOString()
          : undefined,
      })) ?? [],
    [convexHeats],
  );

  const teams: Team[] = useMemo(
    () =>
      convexTeams?.map((t) => ({
        id: t._id,
        name: t.name,
        player_1_id: t.player_1_id ?? undefined,
        player_2_id: t.player_2_id ?? undefined,
        player_3_id: t.player_3_id ?? undefined,
        player_4_id: t.player_4_id ?? undefined,
        image_url: t.image_url,
        is_out: t.is_out,
        created_at: t._creationTime
          ? new Date(t._creationTime).toISOString()
          : undefined,
      })) ?? [],
    [convexTeams],
  );

  const timeTypes: TimeType[] = useMemo(
    () =>
      convexTimeTypes?.map((tt) => ({
        id: tt._id,
        name: tt.name,
        time_eng: tt.time_eng,
        description: tt.description,
      })) ?? [],
    [convexTimeTypes],
  );

  const timeLogs: TimeLog[] = useMemo(
    () =>
      convexTimeLogs?.map((tl) => ({
        id: tl._id,
        player_id: tl.player_id,
        team_id: tl.team_id ?? undefined,
        heat_id: tl.heat_id,
        time_type_id: tl.time_type_id,
        time_seconds: tl.time_seconds,
        time: tl.time,
        created_at: tl._creationTime
          ? new Date(tl._creationTime).toISOString()
          : undefined,
      })) ?? [],
    [convexTimeLogs],
  );

  // Determine loading state - if any query is undefined, we're still loading
  const loading =
    convexPlayers === undefined ||
    convexHeats === undefined ||
    convexTeams === undefined ||
    convexTimeTypes === undefined ||
    convexTimeLogs === undefined;

  // Log initial fetch completion
  useEffect(() => {
    if (!loading) {
      logger.info("initial_fetch_complete", {
        playerCount: players.length,
        heatCount: heats.length,
        teamCount: teams.length,
        timeTypeCount: timeTypes.length,
        timeLogCount: timeLogs.length,
      });
    }
  }, [
    loading,
    players.length,
    heats.length,
    teams.length,
    timeTypes.length,
    timeLogs.length,
    logger,
  ]);

  return {
    players,
    heats,
    teams,
    timeTypes,
    timeLogs,
    alert,
    loading,
    error: null,
    reload,
    lastReloaded,
  };
};

// Default export for backwards compatibility
export default useFetchDataConvex;
