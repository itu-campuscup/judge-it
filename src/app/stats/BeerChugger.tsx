import React, { useState, Fragment, useEffect, useMemo } from "react";
import { Typography, Box, Avatar, Paper, Divider } from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import {
  filterAndSortTimeLogs,
  calculateTimes,
  generateRankableData,
  removeDuplicateTimeEntries,
} from "@/utils/visualizationUtils";
import { formatTime, milliToSecs } from "@/utils/timeUtils";
import { MEDAL_EMOJIS, TIME_TYPE_BEER } from "@/utils/constants";
import { getTimeTypeId } from "@/utils/getUtils";
import BeerAnimation from "./animations/BeerAnimation";
import useYearSelector from "@/app/hooks/useYearSelector";
import YearSelect from "../components/YearSelect";
import { Player, Team, Heat, TimeType, TimeLog } from "@/types";
import { downloadCSV } from "@/utils/exportData";

interface BeerChuggerProps {
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
  actualTime: number;
  displayLabel: string;
  time: number;
}

const BeerChugger: React.FC<BeerChuggerProps> = ({
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
    setAnimationCycleKey((prev) => prev + 1);
  };
  const beerTypeId = getTimeTypeId(TIME_TYPE_BEER, timeTypes);

  const logsForHeatsSortByTime = useMemo(
    () =>
      beerTypeId !== null
        ? filterAndSortTimeLogs(timeLogs, heats, selectedYear, beerTypeId)
        : [],
    [timeLogs, heats, selectedYear, beerTypeId],
  );

  const chugTimes = useMemo(
    () => calculateTimes(logsForHeatsSortByTime),
    [logsForHeatsSortByTime],
  );

  const topChugTimes = useMemo(
    () => removeDuplicateTimeEntries(chugTimes),
    [chugTimes],
  );

  useEffect((): void => {
    if (
      window.location.search.includes("export=true") &&
      topChugTimes.length > 0
    ) {
      downloadCSV(chugTimes, players, teams, heats, "beer_chugger_times.csv");
    }
  }, [topChugTimes]);

  const initialBarData = useMemo(
    () => generateRankableData(topChugTimes, players, teams, heats),
    [topChugTimes, players, teams, heats],
  );

  const processedRankingData = useMemo((): ProcessedRankingData[] => {
    if (beerTypeId === null || initialBarData.length === 0) return [];

    const bestTime = initialBarData[0].time;

    return initialBarData.map((item, index) => {
      const actualTime = item.time;
      let displayLabel: string;

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
  }, [beerTypeId, initialBarData]);

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

  // Early return if beerTypeId is not found - after all hooks
  if (beerTypeId === null) {
    return <div>Beer time type not found</div>;
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
        🍺 Beer Chugger Rankings
      </Typography>

      <Box
        sx={{ display: "flex", justifyContent: "center", mb: 2, flexShrink: 0 }}
      >
        <YearSelect
          years={uniqueYears}
          selectedYear={selectedYear}
          onChange={handleYearChange}
          labelId="year-select-beer-label"
        />
      </Box>

      {processedRankingData.length > 0 ? (
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
                <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
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
                      mb: 0.5,
                    }}
                  >
                    Team: {playerData.teamName}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontSize: "1.25rem" }}
                  >
                    Heat: {playerData.heatNumber}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: "300px",
                    display: "flex",
                    alignItems: "flex-end",
                    flexShrink: 0,
                    mr: 1,
                  }}
                >
                  <BeerAnimation
                    actualTime={playerData.actualTime}
                    playerName={playerData.playerName}
                    animationCycleKey={animationCycleKey}
                  />
                  <Box sx={{ flexGrow: 1, textAlign: "right" }}>
                    <Typography
                      variant="h3"
                      component="div"
                      color={index === 0 ? "primary" : "text.primary"}
                      sx={{
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        mb: 1,
                      }}
                    >
                      {playerData.displayLabel}
                    </Typography>
                    {index > 0 && (
                      <Typography
                        variant="h6"
                        display="block"
                        color="text.secondary"
                        sx={{ fontSize: "1.25rem" }}
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
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              fontSize: "2rem",
            }}
          >
            No beer chugging data available for the selected year.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BeerChugger;
