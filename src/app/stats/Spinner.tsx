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
import { downloadCSV } from "@/utils/exportData";

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

  const logsForHeatsSortByTime = useMemo(
    () =>
      spinnerTypeId !== null
        ? filterAndSortTimeLogs(timeLogs, heats, selectedYear, spinnerTypeId)
        : [],
    [timeLogs, heats, selectedYear, spinnerTypeId]
  );

  const spinTimes = useMemo(
    () => calculateTimes(logsForHeatsSortByTime),
    [logsForHeatsSortByTime]
  );

  const topSpinTimes = useMemo(
    () => removeDuplicateTimeEntries(spinTimes),
    [spinTimes]
  );

  useEffect((): void => {
    if (
      window.location.search.includes("export=true") &&
      topSpinTimes.length > 0
    ) {
      downloadCSV(spinTimes, players, teams, heats, "spinner_times.csv");
    }
  }, [topSpinTimes]);

  const rpmData = useMemo(
    () => generateRPMData(topSpinTimes, players, teams, heats),
    [topSpinTimes, players, teams, heats]
  );

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
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h2"
        gutterBottom
        sx={{
          textAlign: "center",
          mb: 2,
          fontSize: "3rem",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        🌪️ Spinner RPM Rankings
      </Typography>

      <Box
        sx={{ display: "flex", justifyContent: "center", mb: 2, flexShrink: 0 }}
      >
        <YearSelect
          years={uniqueYears}
          selectedYear={selectedYear}
          onChange={handleYearChange}
          labelId="year-select-spinner-label"
        />
      </Box>

      {processedRankingData.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontSize: "2rem",
            }}
          >
            No spin data available for the selected year.
          </Typography>
        </Box>
      )}

      {processedRankingData.length > 0 && (
        <Paper
          elevation={2}
          sx={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            p: 1,
          }}
        >
          {processedRankingData.map((playerData, index) => (
            <Fragment
              key={`${playerData.playerName || index}-${
                playerData.heatNumber
              }-${animationCycleKey}`}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 3,
                  minHeight: "120px",
                  "&:nth-of-type(odd)": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    minWidth: "80px",
                    textAlign: "center",
                    mr: 3,
                    fontSize: "3rem",
                  }}
                >
                  {MEDAL_EMOJIS[index]}
                </Typography>
                {playerData.imageUrl ? (
                  <Avatar
                    src={playerData.imageUrl}
                    alt={playerData.playerName}
                    sx={{ width: 120, height: 120, mr: 3 }}
                  />
                ) : (
                  <Box sx={{ width: 120, height: 120, mr: 3 }} />
                )}
                <Box sx={{ flexGrow: 1, minWidth: 0, mr: 3 }}>
                  <Typography
                    variant="h3"
                    component="div"
                    noWrap
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "2.5rem",
                      fontWeight: "bold",
                      mb: 1,
                    }}
                  >
                    {playerData.playerName}
                  </Typography>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    noWrap
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "1.5rem",
                      mb: 1,
                    }}
                  >
                    Team: {playerData.teamName}
                  </Typography>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{
                      fontSize: "1.5rem",
                    }}
                  >
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
                      variant="h3"
                      component="div"
                      color={index === 0 ? "primary" : "text.primary"}
                      sx={{
                        fontSize: "2rem",
                        fontWeight: "medium",
                        mb: 1,
                      }}
                    >
                      {playerData.displayRpmLabel}
                    </Typography>
                    {index > 0 && (
                      <Typography
                        variant="h5"
                        display="block"
                        color="text.secondary"
                        sx={{
                          fontSize: "1.5rem",
                        }}
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
    </Box>
  );
};

export default Spinner;
