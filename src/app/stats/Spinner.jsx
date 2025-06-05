import React, { useState, Fragment, useEffect, useMemo } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Avatar,
  Paper,
  Divider,
} from "@mui/material";
import {
  filterAndSortTimeLogs,
  calculateTimes,
  generateRPMData,
  removeDuplicateTimeEntries,
} from "@/utils/visualizationUtils";
import { getUniqueYearsGivenHeats } from "@/utils/timeUtils";
import { MEDAL_EMOJIS, TIME_TYPE_SPIN } from "@/utils/constants";
import SpinnerAnimation from "./animations/SpinnerAnimation";
import useYearSelector from "@/hooks/useYearSelector";
import YearSelect from "../components/YearSelect";

const Spinner = ({
  timeLogs = [],
  players = [],
  timeTypes = [],
  teams = [],
  heats = [],
}) => {
  const [animationCycleKey, setAnimationCycleKey] = useState(0);

  const { selectedYear, setSelectedYear, uniqueYears } = useYearSelector(heats);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setAnimationCycleKey((prevKey) => prevKey + 1);
  };

  const spinnerType = timeTypes.find(
    (timeType) => timeType.time_eng === TIME_TYPE_SPIN
  );
  const spinnerTypeId = spinnerType ? spinnerType.id : null;
  const logsForHeatsSortByTime = filterAndSortTimeLogs(
    timeLogs,
    heats,
    selectedYear,
    spinnerTypeId
  );
  const spinTimes = calculateTimes(logsForHeatsSortByTime);
  const topSpinTimes = removeDuplicateTimeEntries(spinTimes);

  const rpmData = generateRPMData(topSpinTimes, players, teams, heats);

  let processedRankingData = useMemo(() => [], []);
  if (rpmData.length > 0) {
    const sortedRpmData = [...rpmData].sort((a, b) => b.rpm - a.rpm);
    const bestRpm = sortedRpmData[0].rpm;

    processedRankingData = sortedRpmData.map((spinnerData, index) => {
      let displayRpmLabel;

      if (index === 0) {
        displayRpmLabel = `${Math.round(spinnerData.rpm)} RPM`;
      } else {
        const difference = bestRpm - spinnerData.rpm;
        displayRpmLabel = `-${Math.round(difference)} RPM`;
      }
      return {
        ...spinnerData,
        displayRpmLabel,
      };
    });
  }

  const maxTimeFor10Revolutions = useMemo(() => {
    if (processedRankingData.length === 0) return 0;
    return Math.max(...processedRankingData.map((p) => p.time || 0));
  }, [processedRankingData]);

  useEffect(() => {
    if (maxTimeFor10Revolutions > 0 && processedRankingData.length > 0) {
      const timer = setTimeout(() => {
        setAnimationCycleKey((prevKey) => prevKey + 1);
      }, maxTimeFor10Revolutions);

      return () => clearTimeout(timer);
    }
  }, [maxTimeFor10Revolutions, animationCycleKey, processedRankingData.length]);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Spinner RPM Rankings
      </Typography>
      <YearSelect
        years={uniqueYears}
        selectedYear={selectedYear}
        onChange={handleYearChange}
        labelId="year-select-spinner-label"
      />

      {processedRankingData.length === 0 && (
        <Typography variant="subtitle1" sx={{ mt: 2, textAlign: "center" }}>
          No spin data available for the selected year.
        </Typography>
      )}

      {processedRankingData.length > 0 && (
        <Paper elevation={2} sx={{ p: 2 }}>
          {processedRankingData.map((playerData, index) => (
            <Fragment
              key={`${playerData.name || playerData.playerName || index}-${playerData.heatNumber
                }-${animationCycleKey}`}
            >
              <Box sx={{ display: "flex", alignItems: "center", p: 2, my: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ minWidth: "30px", textAlign: "center", mr: 2 }}
                >
                  {" "}
                  {/* Adjusted minWidth */}
                  {MEDAL_EMOJIS[index]}
                </Typography>
                {playerData.imageUrl ? (
                  <Avatar
                    src={playerData.imageUrl}
                    alt={playerData.playerName}
                    sx={{ width: 100, height: 100, mr: 2 }}
                  />
                ) : (
                  <Box sx={{ width: 100, height: 100, mr: 2 }} /> // Placeholder for avatar
                )}
                <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
                  {" "}
                  {/* Player Info - This box will grow */}
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
                    width: "180px",
                    display: "flex",
                    alignItems: "flex-end",
                    flexShrink: 0,
                  }}
                >
                  <SpinnerAnimation
                    rpm={playerData.rpm}
                    time={playerData.time}
                    playerName={playerData.playerName}
                    animationCycleKey={animationCycleKey}
                  />
                  <Box sx={{ flexGrow: 1, textAlign: "right" }}>
                    {" "}
                    {/* Text container */}
                    <Typography
                      variant="h5"
                      component="div"
                      color={index === 0 ? "primary" : "text.primary"}
                    >
                      {playerData.displayRpmLabel}
                    </Typography>
                    {index > 0 && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        ({Math.round(playerData.rpm)} RPM)
                      </Typography>
                    )}
                  </Box>
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
