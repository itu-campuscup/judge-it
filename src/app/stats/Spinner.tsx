import React, { useState, Fragment, useEffect, useMemo } from "react";
import { Typography, Box, Avatar, Paper, Divider } from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import {
  filterAndSortTimeLogs,
  calculateTimes,
  generateRPMData,
  removeDuplicateTimeEntries,
} from "@/utils/visualizationUtils";
import { MEDAL_EMOJIS, TIME_TYPE_SPIN } from "@/utils/constants";
import SpinnerAnimation from "./animations/SpinnerAnimation";
import useYearSelector from "@/app/hooks/useYearSelector";
import YearSelect from "../components/YearSelect";
import { Player, Team, Heat, TimeType, TimeLog } from "@/types";

interface SpinnerProps {
  timeLogs: TimeLog[];
  players: Player[];
  timeTypes: TimeType[];
  teams: Team[];
  heats: Heat[];
}

interface ProcessedRankingData {
  playerName: string;
  teamName: string;
  heatNumber: number;
  imageUrl?: string;
  rpm: number;
  time: number;
  displayRpmLabel: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  timeLogs = [],
  players = [],
  timeTypes = [],
  teams = [],
  heats = [],
}) => {
  const [animationCycleKey, setAnimationCycleKey] = useState<number>(0);

  const { selectedYear, setSelectedYear, uniqueYears } = useYearSelector(heats);

  const handleYearChange = (e: SelectChangeEvent<number>): void => {
    setSelectedYear(e.target.value as number);
    setAnimationCycleKey((prevKey) => prevKey + 1);
  };
  const spinnerType = timeTypes.find(
    (timeType) => timeType.time_eng === TIME_TYPE_SPIN
  );
  const spinnerTypeId = spinnerType ? spinnerType.id : null;

  const logsForHeatsSortByTime =
    spinnerTypeId !== null
      ? filterAndSortTimeLogs(timeLogs, heats, selectedYear, spinnerTypeId)
      : [];
  const spinTimes = calculateTimes(logsForHeatsSortByTime);
  const topSpinTimes = removeDuplicateTimeEntries(spinTimes);

  const rpmData = generateRPMData(topSpinTimes, players, teams, heats);

  let processedRankingData = useMemo((): ProcessedRankingData[] => {
    if (spinnerTypeId === null || rpmData.length === 0) return [];

    const sortedRpmData = [...rpmData].sort((a, b) => b.rpm - a.rpm);
    const bestRpm = sortedRpmData[0].rpm;

    return sortedRpmData.map((spinnerData, index) => {
      let displayRpmLabel: string;

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
  }, [spinnerTypeId, rpmData]);

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

  // Early return if spinnerTypeId is not found - after all hooks
  if (spinnerTypeId === null) {
    return <div>Spinner time type not found</div>;
  }

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
              key={`${playerData.playerName || index}-${
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
