import { Typography, Box, Avatar, Paper, Divider } from '@mui/material';
import { useState, Fragment } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { filterAndSortTimeLogs, calculateTimes, generateBarChartData } from '../../utils/chartUtils';
import { formatTime, getUniqueYearsGivenHeats } from '../../utils/timeUtils';

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

const BeerChugger = ({ timeLogs = [], players = [], timeTypes = [], teams = [], heats = [] }) => {
  const [selectedYear, setSelectedYear] = useState('');

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  }

  const beerType = timeTypes.find(timeType => timeType.time_eng === 'Beer');
  const beerTypeId = beerType ? beerType.id : null;

  const uniqueYears = getUniqueYearsGivenHeats(heats);

  const logsForHeatsSortByTime = filterAndSortTimeLogs(timeLogs, heats, selectedYear, beerTypeId);
  const chugTimes = calculateTimes(logsForHeatsSortByTime);
  const topChugTimes = chugTimes.slice(0, 5);

  const initialBarData = generateBarChartData(topChugTimes, players, teams, heats);

  let processedRankingData = [];
  if (initialBarData.length > 0) {
    const bestTime = initialBarData[0].time; 

    processedRankingData = initialBarData.map((item, index) => {
      const actualTime = item.time;
      let displayValue;
      let displayLabel;

      if (index === 0) { 
        displayValue = 0; 
        displayLabel = formatTime(actualTime); 
      } else {
        const timeDifferenceMs = actualTime - bestTime;
        displayValue = timeDifferenceMs / 1000; 
        displayLabel = `+${(timeDifferenceMs / 1000).toFixed(3)}s`;
      }
      return {
        ...item, 
        actualTime,
        displayValue,
        displayLabel,
      };
    });
  }

  return (
    <>
      <Typography variant='h4' gutterBottom>Beer Chugger Rankings</Typography>
      <FormControl fullWidth margin='normal' variant='filled' sx={{ mb: 2 }}>
        <InputLabel id='year-select-beer-label'>Select Year</InputLabel>
        <Select
          labelId='year-select-beer-label'
          id='year-select-beer'
          value={selectedYear}
          label='Select Year'
          onChange={handleYearChange}
        >
          {uniqueYears.map((year) => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {processedRankingData.length > 0 ? (
        <Paper elevation={2} sx={{ p: 2 }}>
          {processedRankingData.map((playerData, index) => (
            <Fragment key={playerData.name || index}> {/* Use a unique key */}
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, my: 1 }}>
                <Typography variant='h6' sx={{ minWidth: '30px', textAlign: 'center', mr: 2 }}>
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
                    {playerData.displayLabel}
                  </Typography>
                  {index > 0 && (
                     <Typography variant='caption' display='block' color='text.secondary'>
                       ({formatTime(playerData.actualTime)})
                     </Typography>
                  )}
                </Box>
              </Box>
              {index < processedRankingData.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Paper>
      ) : (
        <Typography sx={{ mt: 2, textAlign: 'center' }}>No beer chugging data available for the selected year.</Typography>
      )}
    </>
  );
};

export default BeerChugger;
