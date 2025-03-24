import { useState, useEffect } from 'react';
import { supabase } from '@/SupabaseClient';
import AlertComponent from '../components/AlertComponent';
import { Button, Box } from '@mui/material';
import styles from '@/app/page.module.css';
import { getPlayerNameGivenId, getCurrentHeatGivenCtx } from '@/utils/getUtils';

const BeerJudge = ({ players, selectedTeam, selectedPlayer, timeTypes = [], alert }) => {
  // const [alertOpen, setAlertOpen] = useState(false);
  // const [alertSeverity, setAlertSeverity] = useState('error');
  // const [alertText, setAlertText] = useState('');
  const [isTiming, setIsTiming] = useState(false);
  const [participantApproaching, setParticipantApproaching] = useState(false);

  const playerName = getPlayerNameGivenId(players, selectedPlayer.id);

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

  const currentHeat = getCurrentHeatGivenCtx(supabase, alert);

  /**
   * Handle button click to start/stop the timers to send a row to the db
   */
  const handleTimeTypeClick = async (timeTypeId) => {
    const { data, error } = await supabase
      .from('time_logs')
      .insert([{ team_id: selectedTeam, player_id: selectedPlayer, time_type_id: timeTypeId, heat_id: (await currentHeat()).id }]);
    if (error) {
      const err = 'Error inserting time log: ' + error.message;
      alert.setOpen(true);
      alert.setSeverity('error');
      alert.setText(err);
      // setAlertOpen(true);
      // setAlertSeverity('error');
      // setAlertText(err);
      console.error(err);
      return;
    }
    alert.setOpen(true);
    alert.setSeverity('success');
    alert.setText('Inserted log of type: ' + timeTypes.find((e) => e.id === timeTypeId).time_eng);
    // setAlertOpen(true);
    // setAlertSeverity('success');
    setAlertText('Inserted log of type: ' + timeTypes.find((e) => e.id === timeTypeId).time_eng);
  }


  return (
    <>
      <AlertComponent
        severity={alert.severity}
        text={alert.text}
        open={alert.open}
        setOpen={alert.setOpen}
      />
      <Box className={styles.timeTypeButtonContainer}>
        {timeTypeButtons}
      </Box>
    </>
  )
}

export default BeerJudge;
