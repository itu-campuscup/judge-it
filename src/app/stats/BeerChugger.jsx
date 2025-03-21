import { Typography } from '@mui/material';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { filterAndSortTimeLogs, calculateTimes, generateBarChartData } from '../../utils/chartUtils';
import { formatTime } from '../../utils/timeUtils';

const BeerChugger = ({ timeLogs = [], players = [], timeTypes = [], teams = [], heats = [] }) => {
  const [selectedYear, setSelectedYear] = useState('');

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  }

  const beerType = timeTypes.find(timeType => timeType.time_eng === 'Beer');
  const beerTypeId = beerType ? beerType.id : null;

  const uniqueYears = [...new Set(heats.map(heat => new Date(heat.date).getFullYear()))];

  const logsForHeatsSortByTime = filterAndSortTimeLogs(timeLogs, heats, selectedYear, beerTypeId);

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

  const chugTimes = calculateTimes(logsForHeatsSortByTime, getEndTime);

  const topChugTimes = chugTimes.slice(0, 5);

  const barChartData = generateBarChartData(topChugTimes, players, teams, heats);

  const renderCustomLabel = (props) => {
    const { x, y, width, value, index } = props;
    const barData = barChartData[index];
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
    return formatTime(tick);
  }

  const formatTooltip = (value, name, _) => {
    return [formatTime(value), name];
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
        <BarChart width={900} height={500} data={barChartData}>
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
  );
};

export default BeerChugger;
