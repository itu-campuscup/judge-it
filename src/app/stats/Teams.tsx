"use client";

import { Heat, Player, Team, TimeLog, TimeType } from "@/types";
import {
  getBestIntraHeatTime,
  getTeamPlayerIds,
  getTimeTypeBeer,
  getTimeTypeSail,
  getTimeTypeSpinner,
} from "@/utils/getUtils";
import React, { useState, useMemo, useCallback } from "react";
import {
  filterTimeLogsByPlayerId,
  filterTimeLogsByTimeType,
  sortTimeLogsByHeat,
  sortTimeLogsByTime,
} from "@/utils/sortFilterUtils";
import {
  PERFORMANCE_SCALES,
  TIME_TYPE_BEER,
  TIME_TYPE_SAIL,
  TIME_TYPE_SPIN,
} from "@/utils/constants";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import RadarChartComponent from "./components/RadarChartComponent";
import { generateRadarChartData } from "@/utils/visualizationUtils";

interface TeamsProps {
  timeLogs: TimeLog[];
  players: Player[];
  teams: Team[];
  heats: Heat[];
  timeTypes: TimeType[];
}

const Teams: React.FC<TeamsProps> = ({
  timeLogs = [],
  players = [],
  teams = [],
  heats = [],
  timeTypes = [],
}) => {
  const [selectedTeam1Id, setSelectedTeam1Id] = useState<string>("");
  const [selectedTeam2Id, setSelectedTeam2Id] = useState<string>("");

  const handleTeamChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
        | (Event & { target: { value: string; name: string } }),
      teamNumber: number
    ) => {
      if (teamNumber === 1) {
        setSelectedTeam1Id(e.target.value);
      } else if (teamNumber === 2) {
        setSelectedTeam2Id(e.target.value);
      }
    },
    []
  );

  const beerTypeId = getTimeTypeBeer(timeTypes)?.id || 0;
  const spinnerTypeId = getTimeTypeSpinner(timeTypes)?.id || 0;
  const sailTypeId = getTimeTypeSail(timeTypes)?.id || 0;

  const team1Players = useMemo(
    () => getTeamPlayerIds(selectedTeam1Id, teams),
    [selectedTeam1Id, teams]
  );

  const team2Players = useMemo(
    () => getTeamPlayerIds(selectedTeam2Id, teams),
    [selectedTeam2Id, teams]
  );

  const team1LogsSortedByHeatAndTime: TimeLog[][] = useMemo(
    () =>
      team1Players.map((playerId: number) => {
        const logsFilteredByPlayer = filterTimeLogsByPlayerId(
          timeLogs,
          playerId
        );
        const sortedByTime = sortTimeLogsByTime(logsFilteredByPlayer);
        return sortTimeLogsByHeat(sortedByTime);
      }),
    [team1Players, timeLogs]
  );

  const team2LogsSortedByHeatAndTime: TimeLog[][] = useMemo(
    () =>
      team2Players.map((playerId: number) => {
        const logsFilteredByPlayer = filterTimeLogsByPlayerId(
          timeLogs,
          playerId
        );
        const sortedByTime = sortTimeLogsByTime(logsFilteredByPlayer);
        return sortTimeLogsByHeat(sortedByTime);
      }),
    [team2Players, timeLogs]
  );

  const filterPlayerLogsByType = (logs: TimeLog[][], typeId: number) =>
    logs.map((playerLogs: TimeLog[]) =>
      filterTimeLogsByTimeType(playerLogs, typeId)
    );

  const team1BeerLogs = filterPlayerLogsByType(
    team1LogsSortedByHeatAndTime,
    beerTypeId
  );
  const team1SpinnerLogs = filterPlayerLogsByType(
    team1LogsSortedByHeatAndTime,
    spinnerTypeId
  );
  const team1SailLogs = filterPlayerLogsByType(
    team1LogsSortedByHeatAndTime,
    sailTypeId
  );
  const team2BeerLogs = filterPlayerLogsByType(
    team2LogsSortedByHeatAndTime,
    beerTypeId
  );
  const team2SpinnerLogs = filterPlayerLogsByType(
    team2LogsSortedByHeatAndTime,
    spinnerTypeId
  );
  const team2SailLogs = filterPlayerLogsByType(
    team2LogsSortedByHeatAndTime,
    sailTypeId
  );

  const getBestIntraHeatTimeAverage = (logs: TimeLog[][]): number =>
    logs
      .map(
        (playerLog: TimeLog[]) => getBestIntraHeatTime(playerLog)?.duration || 0
      )
      .reduce((acc, cur, _, arr) => acc + cur / arr.length, 0);

  const team1BeerBestAverage = getBestIntraHeatTimeAverage(team1BeerLogs);
  const team1SpinnerBestAverage = getBestIntraHeatTimeAverage(team1SpinnerLogs);
  const team1SailBestAverage = getBestIntraHeatTimeAverage(team1SailLogs);
  const team2BeerBestAverage = getBestIntraHeatTimeAverage(team2BeerLogs);
  const team2SpinnerBestAverage = getBestIntraHeatTimeAverage(team2SpinnerLogs);
  const team2SailBestAverage = getBestIntraHeatTimeAverage(team2SailLogs);

  const team1BestTimes = {
    [TIME_TYPE_BEER]: team1BeerBestAverage,
    [TIME_TYPE_SPIN]: team1SpinnerBestAverage,
    [TIME_TYPE_SAIL]: team1SailBestAverage,
  };
  const team2BestTimes = {
    [TIME_TYPE_BEER]: team2BeerBestAverage,
    [TIME_TYPE_SPIN]: team2SpinnerBestAverage,
    [TIME_TYPE_SAIL]: team2SailBestAverage,
  };

  const team1ChartData = generateRadarChartData(
    Number(selectedTeam1Id),
    team1BestTimes,
    [],
    teams,
    [TIME_TYPE_BEER, TIME_TYPE_SPIN, TIME_TYPE_SAIL],
    false
  );
  const team2ChartData = generateRadarChartData(
    Number(selectedTeam2Id),
    team2BestTimes,
    [],
    teams,
    [TIME_TYPE_BEER, TIME_TYPE_SPIN, TIME_TYPE_SAIL],
    false
  );

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
        🏆 Teams Comparison
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexShrink: 0 }}>
        <FormControl fullWidth margin="normal" variant="filled">
          <InputLabel id="team1-select-label" sx={{ fontSize: "1.2rem" }}>
            Select Team 1
          </InputLabel>
          <Select
            labelId="team1-select-label"
            value={selectedTeam1Id}
            onChange={(e) => handleTeamChange(e, 1)}
            label="Select Team 1"
            sx={{ fontSize: "1.2rem", minHeight: "60px" }}
          >
            {teams.map((team: Team) => (
              <MenuItem
                key={team.id}
                value={team.id}
                sx={{ fontSize: "1.1rem" }}
              >
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" variant="filled">
          <InputLabel id="team2-select-label" sx={{ fontSize: "1.2rem" }}>
            Select Team 2
          </InputLabel>
          <Select
            labelId="team2-select-label"
            value={selectedTeam2Id}
            onChange={(e) => handleTeamChange(e, 2)}
            label="Select Team 2"
            sx={{ fontSize: "1.2rem", minHeight: "60px" }}
          >
            {teams.map((team: Team) => (
              <MenuItem
                key={team.id}
                value={team.id}
                sx={{ fontSize: "1.1rem" }}
              >
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "stretch",
          gap: 3,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <RadarChartComponent
            imageUrl={team1ChartData.imageUrl}
            name={team1ChartData.name}
            altTextType=""
            altText=""
            data={team1ChartData.data}
          />
        </Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <RadarChartComponent
            imageUrl={team2ChartData.imageUrl}
            name={team2ChartData.name}
            altTextType=""
            altText=""
            data={team2ChartData.data}
          />
        </Box>
      </Box>

      <Typography
        variant="h6"
        color="text.secondary"
        align="center"
        sx={{
          flexShrink: 0,
          fontSize: "1.2rem",
          p: 2,
          mt: 2,
        }}
      >
        100% = Excellent performance (under {PERFORMANCE_SCALES.BEER.min}s beer,{" "}
        {PERFORMANCE_SCALES.SPIN.min}s spin, {PERFORMANCE_SCALES.SAIL.min}s
        sail)
        <br />
        0% = Poor performance (over {PERFORMANCE_SCALES.BEER.max}s beer,{" "}
        {PERFORMANCE_SCALES.SPIN.max}s spin, {PERFORMANCE_SCALES.SAIL.max}s
        sail)
        <br />
        (On Average)
      </Typography>
    </Box>
  );
};

export default Teams;
