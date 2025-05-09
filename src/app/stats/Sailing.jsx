import { Typography, Box, Avatar, Paper, Divider } from '@mui/material'; // Updated imports
import { useState, Fragment } from 'react'; // Added Fragment
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { formatTime, getUniqueYearsGivenHeats } from '../../utils/timeUtils';
import { filterAndSortTimeLogs, calculateTimes, generateBarChartData } from '../../utils/chartUtils';

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']; // Added medal emojis

const Sailing = ({ timeLogs = [], players = [], timeTypes = [], teams = [], heats = [] }) => {
  const [selectedYear, setSelectedYear] = useState('');

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  }

  const sailingType = timeTypes.find(e => e.time_eng === 'Sail');
  const sailingTypeId = sailingType ? sailingType.id : null;

  const uniqueYears = getUniqueYearsGivenHeats(heats);

  const logsForHeatsSortByTime = filterAndSortTimeLogs(timeLogs, heats, selectedYear, sailingTypeId);
  const sailTimes = calculateTimes(logsForHeatsSortByTime);
  const topTimes = sailTimes.slice(0, 5);

  // Generate initial data, similar to BeerChugger
  const initialData = generateBarChartData(topTimes, players, teams, heats);

  // Process data for display, similar to BeerChugger
  let processedRankingData = [];
  if (initialData.length > 0) {
    const bestTime = initialData[0].time; // Assuming initialData is sorted

    processedRankingData = initialData.map((item, index) => {
      const actualTime = item.time;
      let displayValue; // This might not be strictly needed for list view but kept for consistency
      let displayLabel;

      if (index === 0) { // Best player
        displayValue = 0;
        displayLabel = formatTime(actualTime); // Show their actual time
      } else {
        const timeDifferenceMs = actualTime - bestTime;
        displayValue = timeDifferenceMs / 1000; // Difference in seconds
        displayLabel = `+${(timeDifferenceMs / 1000).toFixed(3)}s`;
      }
      return {
        ...item, // original data like name, playerName, teamName, imageUrl, etc.
        actualTime,
        displayValue,
        displayLabel,
      };
    });
  }

  return (
    <>
      <Typography variant='h4'>Sailing Rankings</Typography>
      <FormControl fullWidth margin='normal' variant='filled'>
        <InputLabel id='year-select-label'>Year</InputLabel>
        <Select
          labelId='year-select-label'
          id='year-select'
          value={selectedYear}
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
        <Typography sx={{ mt: 2, textAlign: 'center' }}>No sailing data available for the selected year.</Typography>
      )}
    </>
  );
};

export default Sailing;
