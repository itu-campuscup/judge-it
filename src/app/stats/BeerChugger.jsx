import { Typography, Box, Avatar, Paper, Divider } from '@mui/material';
import { useState, Fragment, useEffect, useMemo } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { filterAndSortTimeLogs, calculateTimes, generateChartableData } from '../../utils/visualizationUtils';
import { formatTime, getUniqueYearsGivenHeats, milliToSecs } from '../../utils/timeUtils';

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

const BeerChugger = ({ timeLogs = [], players = [], timeTypes = [], teams = [], heats = [] }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [animationCycleKey, setAnimationCycleKey] = useState(0);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setAnimationCycleKey(prev => prev + 1);
  }

  const beerType = timeTypes.find(timeType => timeType.time_eng === 'Beer');
  const beerTypeId = beerType ? beerType.id : null;

  const uniqueYears = getUniqueYearsGivenHeats(heats);

  const logsForHeatsSortByTime = filterAndSortTimeLogs(timeLogs, heats, selectedYear, beerTypeId);
  const chugTimes = calculateTimes(logsForHeatsSortByTime);
  const topChugTimes = chugTimes.slice(0, 5);

  const initialBarData = generateChartableData(topChugTimes, players, teams, heats);

  let processedRankingData = [];
  if (initialBarData.length > 0) {
    const bestTime = initialBarData[0].time;

    processedRankingData = initialBarData.map((item, index) => {
      const actualTime = item.time;
      let displayLabel;

      if (index === 0) {
        displayLabel = formatTime(actualTime);
      } else {
        const timeDifferenceMs = actualTime - bestTime;
        displayLabel = `+${milliToSecs(timeDifferenceMs, 3)}s`;
      }
      return {
        ...item,
        actualTime,
        displayLabel,
      };
    });
  }

  const maxChugTime = useMemo(() => {
    if (processedRankingData.length === 0) return 0;
    return Math.max(...processedRankingData.map(p => p.actualTime || 0));
  }, [processedRankingData]);

  useEffect(() => {
    if (maxChugTime > 0 && processedRankingData.length > 0) {
      const timer = setTimeout(() => {
        setAnimationCycleKey(prevKey => prevKey + 1);
      }, maxChugTime);

      return () => clearTimeout(timer);
    }
  }, [maxChugTime, animationCycleKey, processedRankingData.length]);

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
            <Fragment key={`${playerData.name || playerData.playerName || index}-${animationCycleKey}`}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, my: 1 }}>
                <Typography variant='h6' sx={{ minWidth: '30px', textAlign: 'center', mr: 2 }}>
                  {MEDAL_EMOJIS[index]}
                </Typography>
                {playerData.imageUrl ? (
                  <Avatar src={playerData.imageUrl} alt={playerData.playerName} sx={{ width: 100, height: 100, mr: 2 }} />
                ) : (
                  <Box sx={{ width: 100, height: 100, mr: 2 }} />
                )}
                <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
                  <Typography variant='h5' component='div' noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {playerData.playerName}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Team: {playerData.teamName}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Heat: {playerData.heatNumber}
                  </Typography>
                </Box>

                <Box sx={{
                  width: '150px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  flexShrink: 0
                }}>
                  {playerData.actualTime > 0 && (
                    <Box
                      key={`beer-anim-${playerData.playerName}-${animationCycleKey}`}
                      aria-label="emptying beer animation"
                      sx={{
                        width: '20px',
                        height: '40px',
                        backgroundColor: 'rgba(255, 223, 0, 0.2)',
                        border: '1px solid #ccc',
                        borderRadius: '3px 3px 0 0',
                        position: 'relative',
                        overflow: 'hidden',
                        marginRight: 1.5,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'gold',
                          height: '100%',
                          transformOrigin: 'bottom',
                          '@keyframes emptyBeerAnimation': {
                            '0%': { transform: 'scaleY(1)' },
                            '100%': { transform: 'scaleY(0)' },
                          },
                          animationName: 'emptyBeerAnimation',
                          animationDuration: `${milliToSecs(playerData.actualTime)}s`,
                          animationTimingFunction: 'linear',
                          animationIterationCount: 1,
                          animationFillMode: 'forwards',
                        },
                      }}
                    />
                  )}
                  {(playerData.actualTime === 0 || !playerData.actualTime) && (
                    <Box sx={{ width: '20px', height: '40px', marginRight: 1.5 }} />
                  )}
                  <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
                    <Typography variant='h5' component='div' color={index === 0 ? 'primary' : 'text.primary'}>
                      {playerData.displayLabel}
                    </Typography>
                    {index > 0 && (
                      <Typography variant='caption' display='block' color='text.secondary'>
                        ({formatTime(playerData.actualTime)})
                      </Typography>
                    )}
                  </Box>
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
