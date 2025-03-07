import { Typography } from '@mui/material';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const Sailing = ({ timeLogs = [], players = [], timeTypes = [], teams = [], heats = [] }) => {
  const [selectedYear, setSelectedYear] = useState('');

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  }

  const sailingType = timeTypes.find(e => e.time_eng === 'Sail');
  const sailingTypeId = sailingType ? sailingType.id : null;

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

  const logsForHeats = [];
  for (let heat of heatsInYear) {
    const filteredTimeLogs = timeLogs.filter(tl => tl.heat_id === heat.id && tl.time_type_id === sailingTypeId);
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

  const formatSailTime = (sailTime) => {
    const ct = sailTime / 1000;
    const minutes = Math.floor(ct / 60);
    const seconds = Math.floor(ct % 60);
    const milliseconds = Math.floor((ct % 1) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
  }

  const calcSailTime = (startTime, endTime) => {
    const start = timeToMilli(startTime);
    const end = timeToMilli(endTime);
    return end - start;
  }

  const sailTimes = [];
  for (let i = 0; i < logsForHeatsSortByTime.length; i++) {
    const log = logsForHeatsSortByTime[i];
    const playerId = log.player_id;
    const heatId = log.heat_id;
    const startTime = log.time;
    const endTime = getEndTime(playerId, heatId, i);
    if (endTime) {
      const sailTime = calcSailTime(startTime, endTime);
      const formattedSailTime = formatSailTime(sailTime);
      sailTimes.push({ playerId: playerId, heatId: heatId, formattedSailTime: formattedSailTime, sailTime: formattedSailTime });
    }
  }

  sailTimes.sort((a, b) => a.sailTime - b.sailTime);

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : '';
  }

  const getHeatNumber = (heatId) => {
    const heat = heats.find(h => h.id === heatId);
    return heat ? heat.heat_number : '';
  }

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : '';
  }

  const getPlayerImage = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.image : '';
  }

  const topTimes = sailTimes.slice(0, 5);
  console.log(topTimes);
  
  const barChart = topTimes.map((sailTime, _) => ({
    time: sailTime.sailTime,
    imageUrl: getPlayerImage(sailTime.playerId),
    playerName: getPlayerName(sailTime.playerId),
    teamName: getTeamName(sailTime.teamId),
    heatNumber: getHeatNumber(sailTime.heatId),
  }));

  const renderCustomLabel = (props) => {
    const { x, y, width, index } = props;
    const barData = barChart[index];
    const offset = -10;
    return (
      <g transform={`translate(${x + width / 2},${y - 10})`}>
        <image href={barData.imageUrl} x={-45} y={offset - 100} height='6em' width='6em' />
        <text x={0} y={offset + 0} textAnchor='middle' dominantBaseline='middle'>{barData.playerName}</text>
        <text x={0} y={offset + 15} textAnchor='middle' dominantBaseline='middle'>{barData.teamName}</text>
        <text x={0} y={offset + 35} textAnchor='middle' dominantBaseline='middle'>{barData.heatNumber}</text>
      </g>
    )
  };

  const formatYAxisTick = (tick) => {
    return formatSailTime(tick);
  }

  const formatTooltip = (value, name, _) => {
    return [formatSailTime(value), name];
  }

  return (
    <>
      <Typography variant='h4'>Sailing</Typography>
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
      <BarChart width={900} height={500} data={barChart}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis tickFormatter={formatYAxisTick} />
        <Tooltip formatter={formatTooltip} />
        <Legend />
        <Bar dataKey='time' fill='#8884d8'>
          <LabelList dataKey='name' content={renderCustomLabel} />
        </Bar>
      </BarChart>
    </>
  )
};

export default Sailing;
