import React, { useEffect } from 'react';
import { FormControl, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { supabase } from '../../SupabaseClient';

const PlayerSelect = ({ selectedTeam, selectedPlayer, setSelectedPlayer, players, setPlayers, selectPlayerString, setSelectPlayerString }) => {
  useEffect(() => {
    if (selectedTeam) {
      const fetchPlayers = async () => {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('player_1_id, player_2_id, player_3_id, player_4_id')
          .eq('id', selectedTeam);
        if (teamError) {
          console.error('Error fetching team:', teamError.message);
          return;
        }
        if (teamData && teamData.length > 0) {
          const playerIds = [
            teamData[0].player_1_id,
            teamData[0].player_2_id,
            teamData[0].player_3_id,
            teamData[0].player_4_id,
          ].filter(id => id !== null && id !== undefined); // Filter out null or undefined IDs
          if (playerIds.length > 0) {
            const { data, error } = await supabase
              .from('players')
              .select('*')
              .in('id', playerIds);
            if (error) {
              console.error('Error fetching players:', error.message);
            } else {
              setPlayers(data);
            }
          } else {
            setPlayers([]); // No valid player IDs
          }
        } else {
          console.error('No team data found');
        }
      };

      fetchPlayers();
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (players.length === 0) {
      setSelectPlayerString('No players found');
    } else {
      setSelectPlayerString('Select Player');
    }
  }, [players]);

  return (
    <FormControl fullWidth margin='normal' variant='filled' disabled={players.length === 0}>
      <Typography id='player-select-label'>{selectPlayerString}</Typography>
      <RadioGroup
        row
        aria-labelledby='player-select-label'
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
      >
        {players.map((player) => (
          <FormControlLabel key={player.id} value={player.id} control={<Radio />} label={player.name} />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default PlayerSelect;
