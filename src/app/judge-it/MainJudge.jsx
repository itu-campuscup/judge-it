import { useState, useEffect } from 'react';
import TeamSelect from './TeamSelect';
import PlayerSelect from './PlayerSelect';
import { Button } from '@mui/material';
import { supabase } from '@/SupabaseClient';
import AlertComponent from '../components/AlertComponent';
import SetHeat from './SetHeat';

const MainJudge = ({ user, parentTeam, parentPlayer, time_types, alert }) => {
  const [teams, setTeams] = useState([]);
  const [players, setTeamPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectPlayerString, setSelectPlayerString] = useState('Select Player');

  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_out', false);
      if (error) {
        const err = 'Error fetching teams: ' + error.message;
        alert.setOpen(true);
        alert.setSeverity('error');
        alert.setText(err);
        console.error(err);
      } else {
        setTeams(data);
      }
    };

    fetchTeams();
  }, [alert]);

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
      alert.setOpen(true);
      alert.setSeverity('error');
      alert.setText(err);
      console.error(err);
    }
    return data[0];
  }

  /**
   * Handle global start timer
   */
  const handleGlobalStart = async () => {
    if (!checkInputs()) return;
    const time_type_id = time_types.find((e) => e.time_eng === 'Sail').id;
    const heatId = (await getHeat()).id;
    const { data, error } = await supabase
      .from('time_logs')
      .insert([
        { team_id: parentTeam, player_id: parentPlayer, time_type_id: time_type_id, heat_id: heatId },
        { team_id: selectedTeamId, player_id: selectedPlayer, time_type_id: time_type_id, heat_id: heatId }
      ]);
    if (error) {
      const err = 'Error starting global timer: ' + error.message;
      alert.setOpen(true);
      alert.setSeverity('error');
      alert.setText(err);
      console.error(err);
    } else {
      alert.setOpen(true);
      alert.setSeverity('success');
      alert.setText('Global timer started');
    }
  }

  /**
   * Check all inputs are present
   * Otherwise create alert
   */
  const checkInputs = () => {
    if (!parentTeam) {
      alert.setOpen(true);
      alert.setSeverity('error');
      alert.setText('Missing team in the top');
      return false;
    } else if (!parentPlayer) {
      alert.setOpen(true);
      alert.setSeverity('error');
      alert.setText('Missing player in the top');
      return false;
    } else if (!selectedTeam) {
      alert.setOpen(true);
      alert.setSeverity('error');
      alert.setText('Missing selected team in the bottom');
      return false;
    } else if (!selectedPlayer) {
      alert.setOpen(true);
      alert.setSeverity('error');
      alert.setText('Missing selected player in the bottom');
      return false;
    }
    return true;
  }

  return (
    <>
      <AlertComponent
        severity={alert.severity}
        text={alert.text}
        open={alert.open}
        setOpen={alert.setOpen}
      />
      <SetHeat user={user} />
      {/**
       * Show team selection as a dropdown
       * Will only show active teams
       */}
      <TeamSelect
        user={user}
        selectedTeamId={selectedTeamId}
        setSelectedTeam={setSelectedTeam}
        teams={teams}
        alert={alert}
      />
      {/**
       * Show player selection as a group of radio buttons
       * Disable the radio group if there are no players
       */}
      <PlayerSelect
        teams={teams}
        selectedTeamId={selectedTeamId}
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={setSelectedPlayer}
        players={players}
        teamPlayers={teamPlayers}
        setTeamPlayers={setTeamPlayers}
        selectPlayerString={selectPlayerString}
        setSelectPlayerString={setSelectPlayerString}
        alert={alert}
      />
      <Button
        variant='contained'
        color='primary'
        onClick={() => handleGlobalStart()}
      >
        Global start
      </Button>
    </>
  )
}

export default MainJudge;
