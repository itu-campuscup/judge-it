'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../SupabaseClient';
import { Container, Box, Typography, FormControl, InputLabel, Select, MenuItem, AppBar, Toolbar, Button, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { useAuth } from '../../AuthContext';
import styles from '../page.module.css';
import TeamSelect from './TeamSelect';
import PlayerSelect from './PlayerSelect';
import MainJudge from './MainJudge';
import Header from '../components/Header';
import ParticipantsJudge from './ParticipantsJudge';
import BeerJudge from './BeerJudge';
import NotLoggedIn from '../components/NotLoggedIn';

function Judge() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectPlayerString, setSelectPlayerString] = useState('Select player');
  const [timeTypes, setTimeTypes] = useState([]);
  const [judgeType, setJudgeType] = useState('');

  /**
   * Fetch time types from the database
   */
  useEffect(() => {
    if (user) {
      const fetchTimeTypes = async () => {
        const { data, error } = await supabase
          .from('time_types')
          .select('*');
        if (error) {
          console.error('Error fetching time types:', error.message);
        } else {
          console.log('Fetching time types:', data);
          setTimeTypes(data);
        }
      };

      fetchTimeTypes();
    }
  }, [user]);


  /**
   * Handle button click to start/stop the timers to send a row to the db
   */
  const handleTimeTypeClick = async (timeTypeId) => {
    if (timeTypeId === -1) {
      timeTypeId = timeTypes.find((e) => e.time_eng === 'Sail').id;
    }
    const { data, error } = await supabase
      .from('time_logs')
      .insert([{ team_id: selectedTeam, player_id: selectedPlayer, time_type_id: timeTypeId, is_start_time: true}]);
    if (error) {
      console.error('Error inserting time log:', error.message);
    } else {
      console.log('Inserted time log:', data);
    }
  }

  if (!user) {
    return <NotLoggedIn />;
  }

  return (
    <Container>
      <Header user={user} />
      <Box className={styles.main}>
        <Typography variant='h3'>Judge Page</Typography>
        <FormControl fullWidth margin='normal' variant='filled'>
          <Typography>Judge type</Typography>
          <RadioGroup
            row
            onChange={(e) => setJudgeType(e.target.value)}
          >
            <FormControlLabel value='main' control={<Radio />} label='Participants main' />
            <FormControlLabel value='participants' control={<Radio />} label='Participants side' />
            <FormControlLabel value='beer' control={<Radio />} label='Beer side' />
          </RadioGroup>
        </FormControl>
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
        {/**
         * Display the specific judge extra functionality
         * 
         * Loads main.jsx if judgeType is main
         * Loads participants.jsx if judgeType is participants side
         * Loads beer.jsx if judgeType is beer side
         */}
        {judgeType === 'main' && <MainJudge
                                    user={user}
                                    parentTeam={selectedTeam}
                                    parentPlayer={selectedPlayer}
                                    time_types={timeTypes}
                                  />}
        {judgeType === 'participants' && <ParticipantsJudge
                                            selectedTeam={selectedTeam}
                                            selectedPlayer={selectedPlayer}
                                            timeTypes={timeTypes}
                                          />}
        {judgeType === 'beer' && <BeerJudge
                                    selectedTeam={selectedTeam}
                                    selectedPlayer={selectedPlayer}
                                    timeTypes={timeTypes}
                                  />}
        {/* <FormControl fullWidth margin='normal' variant='filled'>
          <Box className={styles.timeTypeButtonContainer}>
            <Button
              variant='contained'
              color='primary'
              className={styles.timeTypeButton}
              onClick={() => handleTimeTypeClick(-1)}
            >
              STOP
            </Button>
            {timeTypeButtons}
          </Box>
        </FormControl> */}
      </Box>
    </Container>
  )
}

export default Judge;
