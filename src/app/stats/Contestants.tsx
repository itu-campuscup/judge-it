"use client";

import React, { useState } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Avatar,
} from "@mui/material";
import {
  TIME_TYPE_BEER,
  TIME_TYPE_SPIN,
  TIME_TYPE_SAIL,
  PERFORMANCE_SCALES,
} from "@/utils/constants";
import {
  getBestIntraHeatTime,
  getTimeTypeBeer,
  getTimeTypeSail,
  getTimeTypeSpinner,
  getPlayerNameWithTeam
} from "@/utils/getUtils";
import {
  filterTimeLogsByPlayerId,
  sortTimeLogsByTime,
  sortTimeLogsByHeat,
  filterTimeLogsByTimeType,
} from "@/utils/sortFilterUtils";
import { generateRadarChartData } from "@/utils/visualizationUtils";
import RadarChartComponent from "./components/RadarChartComponent";
import type { TimeLog, Player, Team, Heat } from "@/types";

interface ContestantsProps {
  timeLogs: TimeLog[];
  players: Player[];
  teams: Team[];
  heats: Heat[];
  timeTypes: any[];
}

const Contestants: React.FC<ContestantsProps> = ({
  timeLogs = [],
  players = [],
  timeTypes = [],
  teams = [],
  heats = [],
}) => {
  const [selectedPlayer1Id, setSelectedPlayer1Id] = useState<string>("");
  const [selectedPlayer2Id, setSelectedPlayer2Id] = useState<string>("");

  const handlePlayerChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    playerNumber: number
  ) => {
    if (playerNumber === 1) {
      setSelectedPlayer1Id(e.target.value);
    } else if (playerNumber === 2) {
      setSelectedPlayer2Id(e.target.value);
    }
  };
  const beerTypeId = getTimeTypeBeer(timeTypes)?.id || 0;
  const spinnerTypeId = getTimeTypeSpinner(timeTypes)?.id || 0;
  const sailTypeId = getTimeTypeSail(timeTypes)?.id || 0;
  const logsFilteredByPlayer1 = filterTimeLogsByPlayerId(
    timeLogs,
    Number(selectedPlayer1Id)
  );
  const logsFilteredByPlayer2 = filterTimeLogsByPlayerId(
    timeLogs,
    Number(selectedPlayer2Id)
  );

  const player1logsSortedByHeatAndTime = sortTimeLogsByHeat(
    sortTimeLogsByTime(logsFilteredByPlayer1)
  );
  const player2logsSortedByHeatAndTime = sortTimeLogsByHeat(
    sortTimeLogsByTime(logsFilteredByPlayer2)
  );

  const player1BeerLogs = filterTimeLogsByTimeType(
    player1logsSortedByHeatAndTime,
    beerTypeId
  );
  const player1SpinnerLogs = filterTimeLogsByTimeType(
    player1logsSortedByHeatAndTime,
    spinnerTypeId
  );
  const player1SailLogs = filterTimeLogsByTimeType(
    player1logsSortedByHeatAndTime,
    sailTypeId
  );
  const player2BeerLogs = filterTimeLogsByTimeType(
    player2logsSortedByHeatAndTime,
    beerTypeId
  );
  const player2SpinnerLogs = filterTimeLogsByTimeType(
    player2logsSortedByHeatAndTime,
    spinnerTypeId
  );
  const player2SailLogs = filterTimeLogsByTimeType(
    player2logsSortedByHeatAndTime,
    sailTypeId
  );

  const player1BestTimes = {
    [TIME_TYPE_BEER]: getBestIntraHeatTime(player1BeerLogs)?.duration || 0,
    [TIME_TYPE_SPIN]: getBestIntraHeatTime(player1SpinnerLogs)?.duration || 0,
    [TIME_TYPE_SAIL]: getBestIntraHeatTime(player1SailLogs)?.duration || 0,
  };

  const player2BestTimes = {
    [TIME_TYPE_BEER]: getBestIntraHeatTime(player2BeerLogs)?.duration || 0,
    [TIME_TYPE_SPIN]: getBestIntraHeatTime(player2SpinnerLogs)?.duration || 0,
    [TIME_TYPE_SAIL]: getBestIntraHeatTime(player2SailLogs)?.duration || 0,
  };
  const player1ChartData = generateRadarChartData(
    Number(selectedPlayer1Id),
    player1BestTimes,
    players,
    teams,
    [TIME_TYPE_BEER, TIME_TYPE_SPIN, TIME_TYPE_SAIL]
  );

  const player2ChartData = generateRadarChartData(
    Number(selectedPlayer2Id),
    player2BestTimes,
    players,
    teams,
    [TIME_TYPE_BEER, TIME_TYPE_SPIN, TIME_TYPE_SAIL]
  );

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Contestant Comparison
      </Typography>
      <FormControl fullWidth margin="normal" variant="filled" sx={{ mb: 2 }}>
        <InputLabel id="player1-select-label">Select Player 1</InputLabel>
        <Select
          labelId="player1-select-label"
          value={selectedPlayer1Id}
          onChange={(e) => handlePlayerChange(e, 1)}
          label="Select Player 1"
        >
          {players.map((player) => (
            <MenuItem key={player.id} value={player.id}>
              {getPlayerNameWithTeam(player.id, players, teams)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal" variant="filled" sx={{ mb: 2 }}>
        <InputLabel id="player2-select-label">Select Player 2</InputLabel>
        <Select
          labelId="player2-select-label"
          value={selectedPlayer2Id}
          onChange={(e) => handlePlayerChange(e, 2)}
          label="Select Player 2"
        >
          {players.map((player) => (
            <MenuItem key={player.id} value={player.id}>
              {getPlayerNameWithTeam(player.id, players, teams)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-start",
          my: 4,
          flexWrap: "wrap",
        }}
      >
        <RadarChartComponent
          imageUrl={player1ChartData.imageUrl}
          name={player1ChartData.name}
          altTextType="Fun Fact"
          altText={player1ChartData.funFact || ""}
          data={player1ChartData.data}
        />

        <RadarChartComponent
          imageUrl={player2ChartData.imageUrl}
          name={player2ChartData.name}
          altTextType="Fun Fact"
          altText={player2ChartData.funFact || ""}
          data={player2ChartData.data}
        />
      </Box>

      <Typography variant="body2" color="textSecondary" align="center">
        100% = Excellent performance (under {PERFORMANCE_SCALES.BEER.min}s beer,{" "}
        {PERFORMANCE_SCALES.SPIN.min}s spin, {PERFORMANCE_SCALES.SAIL.min}s
        sail)
        <br />
        0% = Poor performance (over {PERFORMANCE_SCALES.BEER.max}s beer,{" "}
        {PERFORMANCE_SCALES.SPIN.max}s spin, {PERFORMANCE_SCALES.SAIL.max}s
        sail)
      </Typography>
    </>
  );
};

export default Contestants;
