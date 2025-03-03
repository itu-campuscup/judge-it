import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { supabase } from '../../SupabaseClient';
import AlertComponent from '../components/AlertComponent';

const TeamSelect = ({ user, selectedTeam, setSelectedTeam, teams, setTeams }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [alertText, setAlertText] = useState('');

  useEffect(() => {
    if (user) {
      const fetchTeams = async () => {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('is_out', false);
        if (error) {
          const err = 'Error fetching teams:' + error.message;
          setAlertOpen(true);
          setAlertSeverity('error');
          setAlertText(err);
          console.error(err);
        } else {
          setTeams(data);
        }
      };

      fetchTeams();
    }
  }, [user]);

  return (
    <>
      <AlertComponent
        severity={alertSeverity}
        text={alertText}
        open={alertOpen}
        setOpen={setAlertOpen}
      />
      <FormControl fullWidth margin='normal' variant='filled'>
        <InputLabel id='team-select-label'>Select Team</InputLabel>
        <Select
          labelId='team-select-label'
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          {teams.map((team) => (
            <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default TeamSelect;
