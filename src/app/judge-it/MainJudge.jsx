import { useState } from 'react';
import TeamSelect from './TeamSelect';
import PlayerSelect from './PlayerSelect';
import { Button } from '@mui/material';
import { supabase } from '@/SupabaseClient';
import AlertComponent from '../components/AlertComponent';

const MainJudge = ({ user, parentTeam, parentPlayer, time_types }) => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectPlayerString, setSelectPlayerString] = useState('Select Player');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [alertText, setAlertText] = useState('');

  /**
   * Handle global start timer
   */
  const handleGlobalStart = async () => {
    checkInputs();
    const time_type_id = time_types.find((e) => e.time_eng === 'Sail').id;
    const { data, error } = await supabase
      .from('time_logs')
      .insert([
        { team_id: parentTeam, player_id: parentPlayer, time_type_id: time_type_id, is_start_time: true},
        { team_id: selectedTeam, player_id: selectedPlayer, time_type_id: time_type_id, is_start_time: true}
      ])
      if (error) {
        const err = 'Error starting global timer' + error.message;
        setAlertSeverity('error');
        setAlertText(err);
        setAlertOpen(true);
        console.error(err);
      } else {
        setAlertSeverity('success');
        setAlertText('Global timer started');
        setAlertOpen(true);
      }
  }

  /**
   * Check all inputs are present
   * Otherwise create alert
   */
  const checkInputs = () => {
    if (!parentTeam) {
      setAlertSeverity('error');
      setAlertText('Missing team in the top');
      setAlertOpen(true);
      return false;
    } else if (!parentPlayer) {
      setAlertSeverity('error');
      setAlertText('Missing player in the top');
      setAlertOpen(true);
      return false;
    } else if (!selectedTeam) {
      setAlertSeverity('error');
      setAlertText('Missing selected team in the bottom');
      setAlertOpen(true);
      return false;
    } else if (!selectedPlayer) {
      setAlertSeverity('error');
      setAlertText('Missing selected player in the bottom');
      setAlertOpen(true);
      return false;
    }
    return true;
  }

  return (
    <>
      <AlertComponent
        severity={alertSeverity}
        text={alertText}
        open={alertOpen}
        setOpen={setAlertOpen}
      />
      {/**
       * Show team selection as a dropdown
       * Will only show active teams
       */}
      <TeamSelect
        user={user}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        teams={teams}
        setTeams={setTeams}
      />
      {/**
       * Show player selection as a group of radio buttons
       * Disable the radio group if there are no players
      */}
      <PlayerSelect
        selectedTeam={selectedTeam}
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={setSelectedPlayer}
        players={players}
        setPlayers={setPlayers}
        selectPlayerString={selectPlayerString}
        setSelectPlayerString={setSelectPlayerString}
      />
      <Button
        variant='contained'
        color='primary'
        onClick={() => handleGlobalStart()}
      >Global start
      </Button>
    </>
  )
}

export default MainJudge;
