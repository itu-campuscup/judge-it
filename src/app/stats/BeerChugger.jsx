import { Typography, Box, Avatar, Paper, Divider } from "@mui/material";
import { useState, Fragment, useEffect, useMemo } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
  filterAndSortTimeLogs,
  calculateTimes,
  generateRankableData,
  removeDuplicateTimeEntries,
} from "@/utils/visualizationUtils";
import {
  formatTime,
  getUniqueYearsGivenHeats,
  milliToSecs,
} from "@/utils/timeUtils";
import { MEDAL_EMOJIS, TIME_TYPE_BEER } from "@/utils/constants";
import { getTimeTypeId } from "@/utils/getUtils";
import BeerAnimation from "./animations/BeerAnimation";

const BeerChugger = ({
  timeLogs = [],
  players = [],
  timeTypes = [],
  teams = [],
  heats = [],
}) => {
  const [selectedYear, setSelectedYear] = useState("");
  const [animationCycleKey, setAnimationCycleKey] = useState(0);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setAnimationCycleKey((prev) => prev + 1);
  };

  const beerTypeId = getTimeTypeId(TIME_TYPE_BEER, timeTypes);

  const uniqueYears = getUniqueYearsGivenHeats(heats);

  const logsForHeatsSortByTime = filterAndSortTimeLogs(
    timeLogs,
    heats,
    selectedYear,
    beerTypeId
  );
  const chugTimes = calculateTimes(logsForHeatsSortByTime);
  const topChugTimes = removeDuplicateTimeEntries(chugTimes);

  const initialBarData = generateRankableData(
    topChugTimes,
    players,
    teams,
    heats
  );

  let processedRankingData = useMemo(() => [], []);
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
    return Math.max(...processedRankingData.map((p) => p.actualTime || 0));
  }, [processedRankingData]);

  useEffect(() => {
    // Intentional animation cycle: This effect triggers a re-render to animate the ranking data.
    // The cycle is controlled by `animationCycleKey` and stops when `maxChugTime` or `processedRankingData` changes.
    if (maxChugTime > 0 && processedRankingData.length > 0) {
      const timer = setTimeout(() => {
        setAnimationCycleKey((prevKey) => prevKey + 1);
      }, maxChugTime);

      return () => clearTimeout(timer);
    }
  }, [maxChugTime, animationCycleKey, processedRankingData.length]);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Beer Chugger Rankings
      </Typography>
      <FormControl fullWidth margin="normal" variant="filled" sx={{ mb: 2 }}>
        <InputLabel id="year-select-beer-label">Select Year</InputLabel>
        <Select
          labelId="year-select-beer-label"
          id="year-select-beer"
          value={selectedYear}
          label="Select Year"
          onChange={handleYearChange}
        >
          {uniqueYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {processedRankingData.length > 0 ? (
        <Paper elevation={2} sx={{ p: 2 }}>
          {processedRankingData.map((playerData, index) => (
            <Fragment
              key={`${playerData.name || playerData.playerName || index}-${
                playerData.heatNumber
              }-${animationCycleKey}`}
            >
              <Box sx={{ display: "flex", alignItems: "center", p: 2, my: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ minWidth: "30px", textAlign: "center", mr: 2 }}
                >
                  {MEDAL_EMOJIS[index]}
                </Typography>
                {playerData.imageUrl ? (
                  <Avatar
                    src={playerData.imageUrl}
                    alt={playerData.playerName}
                    sx={{ width: 100, height: 100, mr: 2 }}
                  />
                ) : (
                  <Box sx={{ width: 100, height: 100, mr: 2 }} />
                )}
                <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
                  <Typography
                    variant="h5"
                    component="div"
                    noWrap
                    sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {playerData.playerName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    Team: {playerData.teamName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Heat: {playerData.heatNumber}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: "150px",
                    display: "flex",
                    alignItems: "flex-end",
                    flexShrink: 0,
                  }}
                >
                  <BeerAnimation
                    actualTime={playerData.actualTime}
                    playerName={playerData.playerName}
                    animationCycleKey={animationCycleKey}
                  />
                  <Box sx={{ flexGrow: 1, textAlign: "right" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      color={index === 0 ? "primary" : "text.primary"}
                    >
                      {playerData.displayLabel}
                    </Typography>
                    {index > 0 && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
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
        <Typography sx={{ mt: 2, textAlign: "center" }}>
          No beer chugging data available for the selected year.
        </Typography>
      )}
    </>
  );
};

export default BeerChugger;
