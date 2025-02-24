import React, { useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { supabase } from '../../SupabaseClient';

const TeamSelect = ({ user, selectedTeam, setSelectedTeam, teams, setTeams }) => {
  useEffect(() => {
    if (user) {
      const fetchTeams = async () => {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('is_out', false);
        if (error) {
          console.error('Error fetching teams:', error.message);
        } else {
          setTeams(data);
        }
      };

      fetchTeams();
    }
  }, [user]);

  return (
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
  );
};

export default TeamSelect;
