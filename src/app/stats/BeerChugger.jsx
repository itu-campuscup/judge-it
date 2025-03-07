import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const BeerChugger = ({ timeLogs = [], players = [], timeTypes = [], teams = [], heats = [] }) => {
  const [selectedYear, setSelectedYear] = useState('');

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  }

  const beerType = timeTypes.find(timeType => timeType.time_eng === 'Beer');
  const beerTypeId = beerType ? beerType.id : null;

  const uniqueYears = [...new Set(heats.map(heat => new Date(heat.date).getFullYear()))];
  const uniqueHeatYears = [];
  for (let year of uniqueYears) {
    uniqueHeatYears.push(heats.filter(h => new Date(h.date).getFullYear() === year));
  }
  const heatsInYear = [];
  for (let heat of heats) {
    if (new Date(heat.date).getFullYear() === selectedYear) {
      heatsInYear.push(heat);
    }
  }
  console.log('heatsInYear', heatsInYear);

  const logsForHeats = [];
  for (let heat of heatsInYear) {
    const filteredTimeLogs = timeLogs.filter(tl => tl.heat_id === heat.id && tl.time_type_id === beerTypeId);
    logsForHeats.push(...filteredTimeLogs);
  }

  const timeToMilli = (time) => {
    const [hours, minutes, seconds] = time.split(':');
    const [secs, millis] = seconds.split('.');
    const millisValue = parseInt(millis.substring(0, 3));
    return (parseInt(hours) * 60 * 60 * 1000) + (parseInt(minutes) * 60 * 1000) + (parseInt(secs) * 1000) + millisValue;
  }

  const logsForHeatsSortByTime = logsForHeats.sort((a, b) => {
    return timeToMilli(a.time) - timeToMilli(b.time);
  });
  console.log('logsForHeatsSortByTime', logsForHeatsSortByTime);
  
  const endTimeIds = new Set();
  const getEndTime = (playerId, heatId, startIdx) => {
    for (let i = startIdx + 1; i < logsForHeatsSortByTime.length; i++) {
      const curLog = logsForHeatsSortByTime[i];
      if (curLog.player_id === playerId && curLog.heat_id === heatId && !endTimeIds.has(i)) {
        endTimeIds.add(i);
        return curLog.time;
      }
    }
    return null;
  }

  const formatChugTime = (chugTime) => {
    const ct = chugTime / 1000;
    const minutes = Math.floor(ct / 60);
    const seconds = Math.floor(ct % 60);
    const milliseconds = Math.floor((ct % 1) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
  }

  const calcChugTime = (startTime, endTime) => {
    const start = timeToMilli(startTime);
    const end = timeToMilli(endTime);
    console.log(`startTime: ${startTime}, endTime: ${endTime}`);
    console.log(`start: ${start}, end: ${end}, diff: ${end - start}`);
    return end - start;
  }

  const chugTimes = [];
  for (let i = 0; i < logsForHeatsSortByTime.length; i++) {
    if (endTimeIds.has(i)) { continue; }
    const curLog = logsForHeatsSortByTime[i];
    const startTime = curLog.time;
    const playerId = curLog.player_id;
    const heatId = curLog.heat_id;
    const teamId = curLog.team_id;
    const endTime = getEndTime(playerId, heatId, i);
    if (endTime === null) { continue; }
    console.log(logsForHeatsSortByTime[i].player_id);
    const chugDuration = calcChugTime(startTime, endTime);
    const formattedChugTime = formatChugTime(chugDuration);
    chugTimes.push({ playerId: playerId, heatId: heatId, teamId: teamId, formattedChugTime: formattedChugTime, chugTime: chugDuration });
  }

  chugTimes.sort((a, b) => a.chugTime - b.chugTime);

  const getPlayerName = (playerId) => {
    const player = players.find(player => player.id === playerId);
    return player ? player.name : '';
  }

  const getHeatNumber = (heatId) => {
    const heat = heats.find(heat => heat.id === heatId);
    return heat ? heat.heat : '';
  }

  const getTeamName = (teamId) => {
    const team = teams.find(team => team.id === teamId);
    return team ? team.name : '';
  }

  const getPlayerImage = (playerId) => {
    const player = players.find(player => player.id === playerId);
    return player ? player.image_url : '';
  }

  const topTimes = chugTimes.slice(0, 5);
  console.log('topTimesChugTimeMilli')
  topTimes.forEach(c => console.log(`${getPlayerName(c.playerId)}: ${c.chugTime}`));

  const barChart = topTimes.map((chugTime, _) => ({
    // name: `${getPlayerName(chugTime.playerId)} / Team: ${getTeamName(chugTime.teamId)} / Heat: ${getHeatNumber(chugTime.heatId)}`,
    time: chugTime.chugTime,
    imageUrl: getPlayerImage(chugTime.playerId),
    playerName: getPlayerName(chugTime.playerId),
    teamName: getTeamName(chugTime.teamId),
    heatNumber: getHeatNumber(chugTime.heatId),
  }));

  const renderCustomLabel = (props) => {
    const { x, y, width, value, index } = props;
    const barData = barChart[index];
    const offset = -10;
    return (
      <g transform={`translate(${x + width / 2},${y - 10})`}>
        <image href={barData.imageUrl} x={-45} y={offset -100} height='6em' width='6em' />
        <text x={0} y={offset + 0} textAnchor='middle' dominantBaseline='middle'>{barData.playerName}</text>
        <text x={0} y={offset + 15} textAnchor='middle' dominantBaseline='middle'>{barData.teamName}</text>
        <text x={0} y={offset + 35} textAnchor='middle' dominantBaseline='middle'>{barData.heatNumber}</text>
      </g>
    );
  };

  const formatYAxisTick = (tick) => {
    return formatChugTime(tick);
  }

  const formatTooltip = (value, name, _) => {
    return [formatChugTime(value), name];
  }

  return (
    <>
      <Typography variant='h4'>Beer Chugger</Typography>
      <FormControl fullWidth margin='normal' variant='filled'>
        <InputLabel id='year-select-label'>Select Year</InputLabel>
        <Select
          labelId='year-select-label'
          id='year-select'
          value={selectedYear}
          onChange={handleYearChange}
        >
          {uniqueYears.map((year) => {
            return (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            )
          })}
        </Select>
      </FormControl>
      {/* <Typography variant='h6'>Time Logs</Typography>
        {chugTimes.map((timeLog, idx) => (
          <Typography key={idx}>{`Chug Time: ${timeLog.formattedChugTime}`}</Typography>
        ))} */}
        <BarChart width={900} height={500} data={barChart}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis tickFormatter={formatYAxisTick}/>
          <Tooltip formatter={formatTooltip} />
          <Legend />
          <Bar dataKey='time' fill='#8884d8'>
            <LabelList dataKey='name' content={renderCustomLabel} />
          </Bar>
        </BarChart>
    </>
  );
};

export default BeerChugger;
