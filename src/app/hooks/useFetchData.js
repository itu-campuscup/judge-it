import { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { HEATS_TABLE, PLAYERS_TABLE, TEAMS_TABLE, TIME_LOGS_TABLE, TIME_TYPES_TABLE } from "@/utils/constants";

/**
 * Hook to fetch data from db and listen for changes
 * @returns {Object} players, heats, teams, timeTypes, timeLogs, alertOpen, alertSeverity, alertText, setAlertOpen, setAlertSeverity, setAlertText
 */
const useFetchData = () => {
  const [players, setPlayers] = useState([]);
  const [heats, setHeats] = useState([]);
  const [teams, setTeams] = useState([]);
  const [timeTypes, setTimeTypes] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [alertText, setAlertText] = useState("");

  useEffect(() => {
    const fetchTimeLogs = async () => {
      let { data, error } = await supabase.from(TIME_LOGS_TABLE).select("*");
      if (error) {
        const err = "Error fetching time logs: " + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setTimeLogs(data);
      }
    };

    const fetchPlayers = async () => {
      let { data, error } = await supabase.from(PLAYERS_TABLE).select("*");
      if (error) {
        const err = "Error fetching players: " + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setPlayers(data);
      }
    };

    const fetchHeats = async () => {
      let { data, error } = await supabase.from(HEATS_TABLE).select("*");
      if (error) {
        const err = "Error fetching heats: " + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setHeats(data);
      }
    };

    const fetchTeams = async () => {
      let { data, error } = await supabase.from(TEAMS_TABLE).select("*");
      if (error) {
        const err = "Error fetching teams: " + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setTeams(data);
      }
    };

    const fetchTimeTypes = async () => {
      let { data, error } = await supabase.from(TIME_TYPES_TABLE).select("*");
      if (error) {
        const err = "Error fetching time types: " + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setTimeTypes(data);
      }
    };

    fetchPlayers();
    fetchHeats();
    fetchTeams();
    fetchTimeTypes();
    fetchTimeLogs();

    // Realtime listeners
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

    const timeLogsListener = supabase
      .channel("public:time_logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TIME_LOGS_TABLE },
        fetchTimeLogs
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersListener);
      supabase.removeChannel(heatsListener);
      supabase.removeChannel(teamsListener);
      supabase.removeChannel(timeTypesListener);
      supabase.removeChannel(timeLogsListener);
    };
  }, []);

  const alert = {
    open: alertOpen,
    severity: alertSeverity,
    text: alertText,
    setOpen: setAlertOpen,
    setSeverity: setAlertSeverity,
    setText: setAlertText,
  };

  return {
    players,
    heats,
    teams,
    timeTypes,
    timeLogs,
    alert,
  };
};

export default useFetchData;
