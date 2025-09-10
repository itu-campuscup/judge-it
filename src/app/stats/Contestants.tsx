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
  getPlayerNameWithTeam,
} from "@/utils/getUtils";
import {
  filterTimeLogsByPlayerId,
  sortTimeLogsByTime,
  sortTimeLogsByHeat,
  filterTimeLogsByTimeType,
} from "@/utils/sortFilterUtils";
import { generateRadarChartData } from "@/utils/visualizationUtils";
import RadarChartComponent from "./components/RadarChartComponent";
import type { TimeLog, Player, Team, Heat, TimeType } from "@/types";

interface ContestantsProps {
  timeLogs: TimeLog[];
  players: Player[];
  teams: Team[];
  heats: Heat[];
  timeTypes: TimeType[];
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
    e:
      | React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
      | (Event & { target: { value: string; name: string } }),
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
        ⚔️ Contestant Comparison
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexShrink: 0 }}>
        <FormControl fullWidth margin="normal" variant="filled">
          <InputLabel id="player1-select-label" sx={{ fontSize: "1.2rem" }}>
            Select Player 1
          </InputLabel>
          <Select
            labelId="player1-select-label"
            value={selectedPlayer1Id}
            onChange={(e) => handlePlayerChange(e, 1)}
            label="Select Player 1"
            sx={{ fontSize: "1.2rem", minHeight: "60px" }}
          >
            {players.map((player) => (
              <MenuItem
                key={player.id}
                value={player.id}
                sx={{ fontSize: "1.1rem" }}
              >
                {getPlayerNameWithTeam(player.id, players, teams)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" variant="filled">
          <InputLabel id="player2-select-label" sx={{ fontSize: "1.2rem" }}>
            Select Player 2
          </InputLabel>
          <Select
            labelId="player2-select-label"
            value={selectedPlayer2Id}
            onChange={(e) => handlePlayerChange(e, 2)}
            label="Select Player 2"
            sx={{ fontSize: "1.2rem", minHeight: "60px" }}
          >
            {players.map((player) => (
              <MenuItem
                key={player.id}
                value={player.id}
                sx={{ fontSize: "1.1rem" }}
              >
                {getPlayerNameWithTeam(player.id, players, teams)}
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
            imageUrl={player1ChartData.imageUrl}
            name={player1ChartData.name}
            altTextType="Fun Fact"
            altText={player1ChartData.funFact || ""}
            data={player1ChartData.data}
          />
        </Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <RadarChartComponent
            imageUrl={player2ChartData.imageUrl}
            name={player2ChartData.name}
            altTextType="Fun Fact"
            altText={player2ChartData.funFact || ""}
            data={player2ChartData.data}
          />
        </Box>
      </Box>

      <Typography
        variant="h6"
        color="textSecondary"
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
      </Typography>
    </Box>
  );
};

export default Contestants;
