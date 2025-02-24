import { useState, useEffect } from 'react';
import { supabase } from '@/SupabaseClient';
import AlertComponent from '../components/AlertComponent';
import { Button, Box } from '@mui/material';
import styles from '@/app/page.module.css';

const BeerJudge = ({ selectedTeam, selectedPlayer, timeTypes = [] }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [alertText, setAlertText] = useState('');
  const [playerName, setPlayerName] = useState('Unknown');
  const [isTiming, setIsTiming] = useState(false);
  const [participantApproaching, setParticipantApproaching] = useState(false);

  /**
   * Get player name from the db
   */
  useEffect(() => {
    const fetchPlayerName = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('name')
        .eq('id', selectedPlayer);
      if (error) {
        const err = 'Error fetching player name: ' + error.message;
        setAlertOpen(true);
        setAlertSeverity('error');
        setAlertText(err);
        console.error(err);
        setPlayerName('Unknown');
      }
      setPlayerName(data[0].name);
    }

    fetchPlayerName();
  }, [selectedPlayer]);

  /**
   * Create buttons for each time type
   * 
   * @returns {Array} Array of buttons
   */
  const timeTypeButtons = timeTypes.map((timeType) => {
    const sailingText = `${participantApproaching ? 'Stop ' : 'Start '}${playerName} ${timeType.time_eng}`;
    const beerText = `${participantApproaching ? 'Start ' : 'Stop '}${playerName} ${timeType.time_eng}`;
    const spinText = `${participantApproaching ? 'Start ' : 'Stop '}${playerName} ${timeType.time_eng}`;

    const text = (name) => {
      if (name === 'Sail') return sailingText;
      if (name === 'Beer') return beerText;
      if (name === 'Spin') return spinText;
      setAlertOpen(true);
      setAlertSeverity('error');
      setAlertText('Unknown time type');
      console.error('Unknown time type');
      return '';
    }

    return (
      <Button
        key={timeType.id}
        variant='contained'
        color='primary'
        className={styles.timeTypeButton}
        onClick={() => handleTimeTypeClick(timeType.id)}
      >
        {text(timeType.time_eng)}
      </Button>
    )
  }, [timeTypes, playerName, participantApproaching]);

  /**
   * Get current heat
   */
  const getHeat = async () => {
    const { data, error } = await supabase
      .from('heats')
      .select('*')
      .eq('is_current', true);
    if (error) {
      const err = 'Error fetching current heat: ' + error.message;
      setAlertOpen(true);
      setAlertSeverity('error');
      setAlertText(err);
      console.error(err);
    }
    return data[0];
  }

  /**
   * Handle button click to start/stop the timers to send a row to the db
   */
  const handleTimeTypeClick = async (timeTypeId) => {
    const { data, error } = await supabase
      .from('time_logs')
      .insert([{ team_id: selectedTeam, player_id: selectedPlayer, time_type_id: timeTypeId, heat_id: (await getHeat()).id }]);
    if (error) {
      const err = 'Error inserting time log: ' + error.message;
      setAlertOpen(true);
      setAlertSeverity('error');
      setAlertText(err);
      console.error(err);
      return;
    }
    setAlertOpen(true);
    setAlertSeverity('success');
    setAlertText('Inserted log of type: ' + timeTypes.find((e) => e.id === timeTypeId).time_eng);
  }


  return (
    <>
      <AlertComponent
        severity={alertSeverity}
        text={alertText}
        open={alertOpen}
        setOpen={setAlertOpen}
      />
      <Box className={styles.timeTypeButtonContainer}>
        {timeTypeButtons}
      </Box>
    </>
  )
}

export default BeerJudge;
