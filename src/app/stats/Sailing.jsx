import { Typography } from '@mui/material';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { timeToMilli, formatTime, calcTimeDifference } from '../../utils/timeUtils';
import { filterAndSortTimeLogs, calculateTimes, generateBarChartData } from '../../utils/chartUtils';

const Sailing = ({ timeLogs = [], players = [], timeTypes = [], teams = [], heats = [] }) => {
  const [selectedYear, setSelectedYear] = useState('');

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  }

  const sailingType = timeTypes.find(e => e.time_eng === 'Sail');
  const sailingTypeId = sailingType ? sailingType.id : null;

  const uniqueYears = [...new Set(heats.map(heat => new Date(heat.date).getFullYear()))];

  const logsForHeatsSortByTime = filterAndSortTimeLogs(timeLogs, heats, selectedYear, sailingTypeId);

  const getEndTime = (playerId, heatId, startIdx, logsForHeatsSortByTime, endTimeIds) => {
    for (let i = startIdx + 1; i < logsForHeatsSortByTime.length; i++) {
      const curLog = logsForHeatsSortByTime[i];
      if (curLog.player_id === playerId && curLog.heat_id === heatId && !endTimeIds.has(i)) {
        endTimeIds.add(i);
        return curLog.time;
      }
    }
    return null;
  }

  const sailTimes = calculateTimes(logsForHeatsSortByTime, getEndTime);

  const topTimes = sailTimes.slice(0, 5);

  const barChart = generateBarChartData(topTimes, players, teams, heats);

  const renderCustomLabel = (props) => {
    const { x, y, width, value, index } = props;
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
    return formatTime(tick);
  }

  const formatTooltip = (value, name, _) => {
    return [formatTime(value), name];
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
        <YAxis
          tickFormatter={formatYAxisTick}
          reversed={true}
        />
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
