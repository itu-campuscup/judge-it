import { useEffect, useState } from 'react';
import { supabase } from '../../SupabaseClient';

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
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [alertText, setAlertText] = useState('');

  useEffect(() => {
    const fetchTimeLogs = async () => {
      let { data, error } = await supabase
        .from('time_logs')
        .select('*');
      if (error) {
        const err = 'Error fetching time logs: ' + error.message;
        setAlertOpen(true);
        setAlertSeverity('error');
        setAlertText(err);
        console.error(err);
      } else {
        setTimeLogs(data);
        console.log('time logs ', data);
      }
    };

    const fetchPlayers = async () => {
      let { data, error } = await supabase
        .from('players')
        .select('*');
      if (error) {
        const err = 'Error fetching players: ' + error.message;
        setAlertOpen(true);
        setAlertSeverity('error');
        setAlertText(err);
        console.error(err);
      } else {
        setPlayers(data);
        console.log('players ', data);
      }
    };

    const fetchHeats = async () => {
      let { data, error } = await supabase
        .from('heats')
        .select('*');
      if (error) {
        const err = 'Error fetching heats: ' + error.message;
        setAlertOpen(true);
        setAlertSeverity('error');
        setAlertText(err);
        console.error(err);
      } else {
        setHeats(data);
        console.log('heats ', data);
      }
    };

    const fetchTeams = async () => {
      let { data, error } = await supabase
        .from('teams')
        .select('*');
      if (error) {
        const err = 'Error fetching teams: ' + error.message;
        setAlertOpen(true);
        setAlertSeverity('error');
        setAlertText(err);
        console.error(err);
      } else {
        setTeams(data);
        console.log('teams ', data);
      }
    };

    const fetchTimeTypes = async () => {
      let { data, error } = await supabase
        .from('time_types')
        .select('*');
      if (error) {
        const err = 'Error fetching time types: ' + error.message;
        setAlertOpen(true);
        setAlertSeverity('error');
        setAlertText(err);
        console.error(err);
      } else {
        setTimeTypes(data);
        console.log('time types', data);
      }
    };

    fetchPlayers();
    fetchHeats();
    fetchTeams();
    fetchTimeTypes();
    fetchTimeLogs();

    // Realtime listeners
    const playersListener = supabase
      .channel('public:players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchPlayers)
      .subscribe();

    const heatsListener = supabase
      .channel('public:heats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'heats' }, fetchHeats)
      .subscribe();

    const teamsListener = supabase
      .channel('public:teams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, fetchTeams)
      .subscribe();

    const timeTypesListener = supabase
      .channel('public:time_types')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_types' }, fetchTimeTypes)
      .subscribe();

    const timeLogsListener = supabase
      .channel('public:time_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_logs' }, fetchTimeLogs)
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
  }

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
