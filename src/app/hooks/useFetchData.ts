import { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import {
  HEATS_TABLE,
  PLAYERS_TABLE,
  TEAMS_TABLE,
  TIME_LOGS_TABLE,
  TIME_TYPES_TABLE,
} from "@/utils/constants";
import type { Player, Heat, Team, TimeType, TimeLog } from "@/types";

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
    setOpen: (open: boolean) => void;
    setSeverity: (severity: "error" | "success" | "info" | "warning") => void;
    setText: (text: string) => void;
  };
}

/**
 * Hook to fetch data from db and listen for changes
 * @returns {UseFetchDataReturn} players, heats, teams, timeTypes, timeLogs, and alert object
 */
const useFetchData = (): UseFetchDataReturn => {
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

  useEffect(() => {
    const fetchTimeLogs = async (): Promise<void> => {
      let { data, error } = await supabase.from(TIME_LOGS_TABLE).select("*");
      if (error) {
        const err = "Error fetching time logs: " + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setTimeLogs(data || []);
      }
    };

    const fetchPlayers = async (): Promise<void> => {
      let { data, error } = await supabase.from(PLAYERS_TABLE).select("*");
      if (error) {
        const err = "Error fetching players: " + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setPlayers(data || []);
      }
    };

    const fetchHeats = async (): Promise<void> => {
      let { data, error } = await supabase.from(HEATS_TABLE).select("*");
      if (error) {
        const err = "Error fetching heats: " + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setHeats(data || []);
      }
    };

    const fetchTeams = async (): Promise<void> => {
      let { data, error } = await supabase.from(TEAMS_TABLE).select("*");
      if (error) {
        const err = "Error fetching teams: " + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setTeams(data || []);
      }
    };

    const fetchTimeTypes = async (): Promise<void> => {
      let { data, error } = await supabase.from(TIME_TYPES_TABLE).select("*");
      if (error) {
        const err = "Error fetching time types: " + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setTimeTypes(data || []);
      }
    };

    // Initial fetch
    fetchTimeLogs();
    fetchPlayers();
    fetchHeats();
    fetchTeams();
    fetchTimeTypes();

    // Set up real-time listeners
    const timeLogsListener = supabase
      .channel("public:time_logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TIME_LOGS_TABLE },
        fetchTimeLogs
      )
      .subscribe();

    const playersListener = supabase
      .channel("public:players")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: PLAYERS_TABLE },
        fetchPlayers
      )
      .subscribe();

    const heatsListener = supabase
      .channel("public:heats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: HEATS_TABLE },
        fetchHeats
      )
      .subscribe();

    const teamsListener = supabase
      .channel("public:teams")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TEAMS_TABLE },
        fetchTeams
      )
      .subscribe();

    const timeTypesListener = supabase
      .channel("public:time_types")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TIME_TYPES_TABLE },
        fetchTimeTypes
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(timeLogsListener);
      supabase.removeChannel(playersListener);
      supabase.removeChannel(heatsListener);
      supabase.removeChannel(teamsListener);
      supabase.removeChannel(timeTypesListener);
    };
  }, []);

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
      setOpen: setAlertOpen,
      setSeverity: setAlertSeverity,
      setText: setAlertText,
    },
  };
};

export default useFetchData;
