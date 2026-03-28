"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
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
} from "@/utils/getUtils";
import {
  filterTimeLogsByPlayerId,
  filterTimeLogsByTimeType,
  sortTimeLogsByHeatAndTime,
} from "@/utils/sortFilterUtils";
import { generateRadarChartData } from "@/utils/visualizationUtils";
import RadarChartComponent from "./components/RadarChartComponent";
import { Id } from "convex/_generated/dataModel";
import useFetchDataConvex from "../hooks/useFetchDataConvex";

const Contestants: React.FC = () => {
  const [selectedPlayer1Id, setSelectedPlayer1Id] = useState<string>("");
  const [selectedPlayer2Id, setSelectedPlayer2Id] = useState<string>("");

  const { players, teams, timeLogs, timeTypes } = useFetchDataConvex();

  const handlePlayerChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
        | (Event & { target: { value: string; name: string } }),
      playerNumber: number,
    ) => {
      if (playerNumber === 1) {
        setSelectedPlayer1Id(e.target.value);
      } else if (playerNumber === 2) {
        setSelectedPlayer2Id(e.target.value);
      }
    },
    [],
  );

  const beerTypeId = useMemo(
    () => getTimeTypeBeer(timeTypes)?.id || "",
    [timeTypes],
  );
  const spinnerTypeId = useMemo(
    () => getTimeTypeSpinner(timeTypes)?.id || "",
    [timeTypes],
  );
  const sailTypeId = useMemo(
    () => getTimeTypeSail(timeTypes)?.id || "",
    [timeTypes],
  );

  // Performance Optimization: Create a player-to-team lookup Map to reduce
  // dropdown option generation complexity from O(P*T) to O(P+T).
  const playerOptions = useMemo(() => {
    // 1. Build team lookup map (PlayerID -> TeamName)
    const playerToTeamMap = new Map<string, string>();
    teams.forEach((team) => {
      if (team.player_1_id) playerToTeamMap.set(team.player_1_id, team.name);
      if (team.player_2_id) playerToTeamMap.set(team.player_2_id, team.name);
      if (team.player_3_id) playerToTeamMap.set(team.player_3_id, team.name);
      if (team.player_4_id) playerToTeamMap.set(team.player_4_id, team.name);
    });

    // 2. Generate options using O(1) lookups
    return players.map((player) => {
      const teamName = playerToTeamMap.get(player.id) || "No Team";
      return {
        id: player.id,
        label: `${player.name} - ${teamName}`,
      };
    });
  }, [players, teams]);

  // Performance Optimization: Memoize all data transformations to prevent
  // expensive re-computations and radar chart re-renders when parent state updates.
  // This reduces the per-render cost from O(N) log filtering to O(1) cache lookup.

  const logsFilteredByPlayer1 = useMemo(
    () =>
      filterTimeLogsByPlayerId(timeLogs, selectedPlayer1Id as Id<"players">),
    [timeLogs, selectedPlayer1Id],
  );

  const logsFilteredByPlayer2 = useMemo(
    () =>
      filterTimeLogsByPlayerId(timeLogs, selectedPlayer2Id as Id<"players">),
    [timeLogs, selectedPlayer2Id],
  );

  const player1logsSortedByHeatAndTime = useMemo(
    () => sortTimeLogsByHeatAndTime(logsFilteredByPlayer1),
    [logsFilteredByPlayer1],
  );

  const player2logsSortedByHeatAndTime = useMemo(
    () => sortTimeLogsByHeatAndTime(logsFilteredByPlayer2),
    [logsFilteredByPlayer2],
  );

  const player1BeerLogs = useMemo(
    () =>
      filterTimeLogsByTimeType(
        player1logsSortedByHeatAndTime,
        beerTypeId as Id<"time_types">,
      ),
    [player1logsSortedByHeatAndTime, beerTypeId],
  );
  const player1SpinnerLogs = useMemo(
    () =>
      filterTimeLogsByTimeType(
        player1logsSortedByHeatAndTime,
        spinnerTypeId as Id<"time_types">,
      ),
    [player1logsSortedByHeatAndTime, spinnerTypeId],
  );
  const player1SailLogs = useMemo(
    () =>
      filterTimeLogsByTimeType(
        player1logsSortedByHeatAndTime,
        sailTypeId as Id<"time_types">,
      ),
    [player1logsSortedByHeatAndTime, sailTypeId],
  );
  const player2BeerLogs = useMemo(
    () =>
      filterTimeLogsByTimeType(
        player2logsSortedByHeatAndTime,
        beerTypeId as Id<"time_types">,
      ),
    [player2logsSortedByHeatAndTime, beerTypeId],
  );
  const player2SpinnerLogs = useMemo(
    () =>
      filterTimeLogsByTimeType(
        player2logsSortedByHeatAndTime,
        spinnerTypeId as Id<"time_types">,
      ),
    [player2logsSortedByHeatAndTime, spinnerTypeId],
  );
  const player2SailLogs = useMemo(
    () =>
      filterTimeLogsByTimeType(
        player2logsSortedByHeatAndTime,
        sailTypeId as Id<"time_types">,
      ),
    [player2logsSortedByHeatAndTime, sailTypeId],
  );

  const player1BestTimes = useMemo(
    () => ({
      [TIME_TYPE_BEER]: getBestIntraHeatTime(player1BeerLogs)?.duration || 0,
      [TIME_TYPE_SPIN]: getBestIntraHeatTime(player1SpinnerLogs)?.duration || 0,
      [TIME_TYPE_SAIL]: getBestIntraHeatTime(player1SailLogs)?.duration || 0,
    }),
    [player1BeerLogs, player1SpinnerLogs, player1SailLogs],
  );

  const player2BestTimes = useMemo(
    () => ({
      [TIME_TYPE_BEER]: getBestIntraHeatTime(player2BeerLogs)?.duration || 0,
      [TIME_TYPE_SPIN]: getBestIntraHeatTime(player2SpinnerLogs)?.duration || 0,
      [TIME_TYPE_SAIL]: getBestIntraHeatTime(player2SailLogs)?.duration || 0,
    }),
    [player2BeerLogs, player2SpinnerLogs, player2SailLogs],
  );

  const player1ChartData = useMemo(
    () =>
      generateRadarChartData(
        selectedPlayer1Id,
        player1BestTimes,
        players,
        teams,
        [TIME_TYPE_BEER, TIME_TYPE_SPIN, TIME_TYPE_SAIL],
      ),
    [selectedPlayer1Id, player1BestTimes, players, teams],
  );

  const player2ChartData = useMemo(
    () =>
      generateRadarChartData(
        selectedPlayer2Id,
        player2BestTimes,
        players,
        teams,
        [TIME_TYPE_BEER, TIME_TYPE_SPIN, TIME_TYPE_SAIL],
      ),
    [selectedPlayer2Id, player2BestTimes, players, teams],
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
            {playerOptions.map((option) => (
              <MenuItem
                key={option.id}
                value={option.id}
                sx={{ fontSize: "1.1rem" }}
              >
                {option.label}
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
            {playerOptions.map((option) => (
              <MenuItem
                key={option.id}
                value={option.id}
                sx={{ fontSize: "1.1rem" }}
              >
                {option.label}
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
