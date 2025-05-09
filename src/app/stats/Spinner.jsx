import React, { useState, Fragment } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, Box, Avatar, Paper, Divider } from '@mui/material';
import { filterAndSortTimeLogs, calculateTimes, generateChartableData, generateRPMData } from '../../utils/visualizationUtils';
import { milliToSecs, getUniqueYearsGivenHeats, calcRPM } from '../../utils/timeUtils';

const REVOLUTIONS = 10;
const MEDAL_EMOJIS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

const Spinner = ({ timeLogs = [], players = [], timeTypes = [], teams = [], heats = [] }) => {
  const [selectedYear, setSelectedYear] = useState('');

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const spinnerType = timeTypes.find(timeType => timeType.time_eng === 'Spin');
  const spinnerTypeId = spinnerType ? spinnerType.id : null;
  const uniqueYears = getUniqueYearsGivenHeats(heats);
  const logsForHeatsSortByTime = filterAndSortTimeLogs(timeLogs, heats, selectedYear, spinnerTypeId);
  const spinTimes = calculateTimes(logsForHeatsSortByTime);
  const topSpinTimes = spinTimes.slice(0, 5);
  const rpmData = generateRPMData(topSpinTimes, players, teams, heats, REVOLUTIONS);

  let processedRankingData = [];
  if (rpmData.length > 0) {
    const sortedRpmData = [...rpmData].sort((a, b) => b.rpm - a.rpm);
    const bestRpm = sortedRpmData[0].rpm;

    processedRankingData = sortedRpmData.map((spinnerData, index) => {
      let displayRpmLabel;

      if (index === 0) {
        displayRpmLabel = `${Math.round(spinnerData.rpm)} RPM`;
      } else {
        const difference = bestRpm - spinnerData.rpm;
        displayRpmLabel = `-${Math.round(difference)} RPM`;
      }
      return {
        ...spinnerData,
        displayRpmLabel,
      };
    });
  }

  return (
    <>
      <Typography variant='h4' gutterBottom>Spinner RPM Rankings</Typography>
      <FormControl fullWidth margin='normal' variant='filled' sx={{ mb: 2 }}>
        <InputLabel id='year-select-spinner-label'>Select Year</InputLabel>
        <Select
          labelId='year-select-spinner-label'
          id='year-select-spinner'
          value={selectedYear}
          onChange={handleYearChange}
          label='Select Year'
        >
          {uniqueYears.map((year) => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {processedRankingData.length === 0 && (
        <Typography variant='subtitle1' sx={{ mt: 2, textAlign: 'center' }}>
          No spin data available for the selected year.
        </Typography>
      )}

      {processedRankingData.length > 0 && (
        <Paper elevation={2} sx={{ p: 2 }}>
          {processedRankingData.map((playerData, index) => (
            <Fragment key={playerData.name || playerData.playerName || index}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, my: 1 }}>
                <Typography variant='h6' sx={{ minWidth: '40px', textAlign: 'center', mr: 2 }}>
                  {MEDAL_EMOJIS[index]}
                </Typography>
                {playerData.imageUrl && (
                  <Avatar src={playerData.imageUrl} alt={playerData.playerName} sx={{ width: 56, height: 56, mr: 2 }} />
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant='h5' component='div'>
                    {playerData.playerName}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Team: {playerData.teamName}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Heat: {playerData.heatNumber}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center' }}>
                  {playerData.rpm > 0 && (
                    <Typography
                      component="span"
                      aria-label="spinning gear icon"
                      sx={{
                        fontSize: '2.5rem',
                        marginRight: 3,
                        display: 'inline-block',
                        '@keyframes spinAnimation': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(-360deg)' },
                        },
                        animation: `spinAnimation ${60 / playerData.rpm}s linear infinite`,
                      }}
                    >
                      🌀
                    </Typography>
                  )}
                  {(playerData.rpm === 0 || !playerData.rpm) && (
                     <Box sx={{ width: '2.5rem', height: '2.5rem', marginRight: 1.5, display: 'inline-block' }} />
                  )}
                  <Box>
                    <Typography variant='h5' component='div' color={index === 0 ? 'primary' : 'text.primary'}>
                      {playerData.displayRpmLabel}
                    </Typography>
                    {index > 0 && (
                       <Typography variant='caption' display='block' color='text.secondary'>
                         ({Math.round(playerData.rpm)} RPM)
                       </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
              {index < processedRankingData.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Paper>
      )}
    </>
  );
};

export default Spinner;
