'use client';

import { useState, useEffect } from 'react';;
import { Container, Box, Typography, AppBar, Toolbar, IconButton, Menu, MenuItem, Button } from '@mui/material';
import Header from '../components/Header';
import BeerChugger from './BeerChugger';
import Sailing from './Sailing';
import Spinner from './Spinner';
import { useAuth } from '../../AuthContext';
import NotLoggedIn from '../components/NotLoggedIn';
import AlertComponent from '../components/AlertComponent';
import useFetchData from '../hooks/useFetchData';

function Stats() {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStat, setSelectedStat] = useState('BeerChugger');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (stat) => {
    setSelectedStat(stat);
    handleMenuClose();
  };

  const {
    players,
    heats,
    teams,
    timeTypes,
    timeLogs,
    alert,
  } = useFetchData();

  if (!user) {
    return <NotLoggedIn />;
  }

  return (
    <Container>
      <Header user={user} />
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
            🍔 menu
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleMenuItemClick('BeerChugger')}>Beer Chugger</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('Sailing')}>Sailing</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('Spinner')}>Spinner</MenuItem>
          </Menu>
          <Typography variant="h6">
            Stats
          </Typography>
        </Toolbar>
      </AppBar>
      <Box>
        {selectedStat === 'BeerChugger' && <BeerChugger
                                              timeLogs={timeLogs}
                                              players={players}
                                              timeTypes={timeTypes}
                                              teams={teams}
                                              heats={heats}
                                              alert={alert}
                                            />}
        {selectedStat === 'Sailing' && <Sailing
                                          timeLogs={timeLogs}
                                          players={players}
                                          timeTypes={timeTypes}
                                          teams={teams}
                                          heats={heats}
                                          alert={alert}
                                        />}
        {selectedStat === 'Spinner' && <Spinner
                                          timeLogs={timeLogs}
                                          players={players}
                                          timeTypes={timeTypes}
                                          teams={teams}
                                          heats={heats}
                                          alert={alert}
                                        />}
      </Box>
      <AlertComponent
        open={alert.open}
        severity={alert.severity}
        text={alert.text}
        setOpen={alert.setOpen}
      />
    </Container>
  );
}

export default Stats;
