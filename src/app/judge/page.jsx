'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../SupabaseClient';
import { Container, Box, Typography, FormControl, InputLabel, Select, MenuItem, AppBar, Toolbar, Button, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { useAuth } from '../../AuthContext';
import styles from '../page.module.css';

export default function Judge() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectPlayerString, setSelectPlayerString] = useState('Select player');

  /**
   * Fetch teams from the database
   */
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

  /**
   * Fetch players from the database
   */
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

  /**
   * Set the select player string based on the players array
   */
  useEffect(() => {
    if (players.length === 0) {
      setSelectPlayerString('No players found');
    } else {
      setSelectPlayerString('Select Player');
    }
  }, [players]);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    }
  };

  /**
   * If the user is not logged in, show a message and a link to the home page
   */
  if (!user) {
    return (
      <Container className={styles.page}>
        <Typography variant="h4">You need to be logged in to view this page.</Typography>
        <Button variant="contained" color="primary" href="/">Go to Home</Button>
      </Container>
    );
  }

  return (
    <Container className={styles.page}>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Box className={styles.main}>
        <Typography variant="h1">Judge Page</Typography>
        {/**
         * Show team selection as a dropdown
         * Will only show active teams
         */}
        <FormControl fullWidth margin="normal" variant='filled'>
          <InputLabel id="team-select-label">Select Team</InputLabel>
          <Select
            labelId="team-select-label"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/**
         * Show player selection as a group of radio buttons
         * Disable the radio group if there are no players
        */}
        <FormControl fullWidth margin="normal" variant='filled' disabled={players.length === 0}>
          <Typography id="player-select-label">{selectPlayerString}</Typography>
          <RadioGroup
            row
            aria-labelledby="player-select-label"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            {players.map((player) => (
                <FormControlLabel key={player.id} value={player.id} control={<Radio />} label={player.name} />
              ))}
          </RadioGroup>
        </FormControl>
      </Box>
    </Container>
  );
}
