import React, { useState, Fragment } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, Box, Avatar, Paper, Divider } from '@mui/material';
import { filterAndSortTimeLogs, calculateTimes, generateBarChartData } from '../../utils/chartUtils';
import { milliToSecs, getUniqueYearsGivenHeats } from '../../utils/timeUtils';

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

  const chartData = generateBarChartData(topSpinTimes, players, teams, heats);

  const rpmData = chartData.map(data => {
    const rpm = data.time > 0 ? (REVOLUTIONS / milliToSecs(data.time)) * 60 : 0;
    return {
      ...data,
      actualRpm: rpm,
    };
  });

  let processedRankingData = [];
  if (rpmData.length > 0) {
    const sortedRpmData = [...rpmData].sort((a, b) => b.actualRpm - a.actualRpm);
    const bestRpm = sortedRpmData[0].actualRpm;

    processedRankingData = sortedRpmData.map((spinnerData, index) => {
      let displayRpmLabel;

      if (index === 0) {
        displayRpmLabel = `${Math.round(spinnerData.actualRpm)} RPM`;
      } else {
        const difference = bestRpm - spinnerData.actualRpm;
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
                  <Avatar src={playerData.imageUrl} alt={playerData.playerName} sx={{ width: 100, height: 100, mr: 2 }} />
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant='h6' component='div'>
                    {playerData.playerName}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Team: {playerData.teamName}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Heat: {playerData.heatNumber}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant='h6' component='div' color={index === 0 ? 'primary' : 'text.primary'}>
                    {playerData.displayRpmLabel}
                  </Typography>
                  {index > 0 && (
                     <Typography variant='caption' display='block' color='text.secondary'>
                       ({Math.round(playerData.actualRpm)} RPM)
                     </Typography>
                  )}
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
