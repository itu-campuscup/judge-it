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

  const logsForHeatsSortByTime =
    beerTypeId !== null
      ? filterAndSortTimeLogs(timeLogs, heats, selectedYear, beerTypeId)
      : [];
  const chugTimes = calculateTimes(logsForHeatsSortByTime);
  const topChugTimes = removeDuplicateTimeEntries(chugTimes);

  const initialBarData = generateRankableData(
    topChugTimes,
    players,
    teams,
    heats
  );

  let processedRankingData = useMemo((): ProcessedRankingData[] => {
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
    <>
      <Typography variant="h4" gutterBottom>
        Beer Chugger Rankings
      </Typography>
      <YearSelect
        years={uniqueYears}
        selectedYear={selectedYear}
        onChange={handleYearChange}
        labelId="year-select-beer-label"
      />

      {processedRankingData.length > 0 ? (
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
