import { Typography, Box, Avatar, Paper, Divider } from "@mui/material";
import { useState, Fragment, useEffect, useMemo } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
  formatTime,
  getUniqueYearsGivenHeats,
  milliToSecs,
} from "@/utils/timeUtils";
import {
  filterAndSortTimeLogs,
  calculateTimes,
  generateRankableData,
  removeDuplicateTimeEntries,
} from "@/utils/visualizationUtils";
import { MEDAL_EMOJIS, TIME_TYPE_SAIL } from "@/utils/constants";
import SailingAnimation from "./animations/SailingAnimation";

const Sailing = ({
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

  const sailingType = timeTypes.find((e) => e.time_eng === TIME_TYPE_SAIL);
  const sailingTypeId = sailingType ? sailingType.id : null;
  const uniqueYears = getUniqueYearsGivenHeats(heats);
  const logsForHeatsSortByTime = filterAndSortTimeLogs(
    timeLogs,
    heats,
    selectedYear,
    sailingTypeId
  );
  const sailTimes = calculateTimes(logsForHeatsSortByTime);
  const topTimes = removeDuplicateTimeEntries(sailTimes);

  const sailData = generateRankableData(topTimes, players, teams, heats);

  let processedRankingData = useMemo(() => [], []);
  if (sailData.length > 0) {
    const bestTime = sailData[0].time;

    processedRankingData = sailData.map((item, index) => {
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

  const maxSailTime = useMemo(() => {
    if (processedRankingData.length === 0) return 0;
    return Math.max(...processedRankingData.map((p) => p.actualTime || 0));
  }, [processedRankingData]);

  useEffect(() => {
    // Intentional animation cycle: This effect triggers a re-render to animate the ranking data.
    // The cycle is controlled by `animationCycleKey` and stops when `maxSailTime` or `processedRankingData` changes.
    if (maxSailTime > 0 && processedRankingData.length > 0) {
      const timer = setTimeout(() => {
        setAnimationCycleKey((prevKey) => prevKey + 1);
      }, maxSailTime);

      return () => clearTimeout(timer);
    }
  }, [maxSailTime, animationCycleKey, processedRankingData.length]);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Sailing Rankings
      </Typography>
      <FormControl fullWidth margin="normal" variant="filled" sx={{ mb: 2 }}>
        <InputLabel id="year-select-sailing-label">Select Year</InputLabel>
        <Select
          labelId="year-select-sailing-label"
          id="year-select-sailing"
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
                    width: "600px",
                    display: "flex",
                    alignItems: "flex-end",
                    flexShrink: 0,
                  }}
                >
                  <SailingAnimation
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
          No sailing data available for the selected year.
        </Typography>
      )}
    </>
  );
};

export default Sailing;
