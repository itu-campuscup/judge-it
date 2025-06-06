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
} from "@/utils/constants";
import {
  getBestIntraHeatTime,
  getPlayerName,
  getTimeType,
} from "@/utils/getUtils";
import {
  filterTimeLogsByPlayerId,
  sortTimeLogsByTime,
  sortTimeLogsByHeat,
} from "@/utils/sortFilterUtils";
import { useState } from "react";
import { generateRadarChartData } from "@/utils/visualizationUtils";
import RadarChartComponent from "./components/RadarChartComponent";

const PERFORMANCE_SCALES = {
  BEER: {
    MIN_TIME: 2000, // 2 seconds
    MAX_TIME: 120000, // 120 seconds (2 minutes)
  },
  SPIN: {
    MIN_TIME: 5000, // 5 seconds
    MAX_TIME: 60000, // 60 seconds (1 minute)
  },
  SAIL: {
    MIN_TIME: 10000, // 10 seconds
    MAX_TIME: 120000, // 120 seconds (2 minutes)
  },
};

const Contestants = ({
  timeLogs = [],
  players = [],
  timeTypes = [],
  teams = [],
  heats = [],
}) => {
  const [selectedPlayer1Id, setSelectedPlayer1Id] = useState("");
  const [selectedPlayer2Id, setSelectedPlayer2Id] = useState("");

  const handlePlayerChange = (e, playerNumber) => {
    if (playerNumber === 1) {
      setSelectedPlayer1Id(e.target.value);
    } else if (playerNumber === 2) {
      setSelectedPlayer2Id(e.target.value);
    }
  };

  const beerTypeId = getTimeType(TIME_TYPE_BEER, timeTypes).id;
  const spinnerId = getTimeType(TIME_TYPE_SPIN, timeTypes).id;
  const sailId = getTimeType(TIME_TYPE_SAIL, timeTypes).id;

  const logsFilteredByPlayer1 = filterTimeLogsByPlayerId(
    timeLogs,
    selectedPlayer1Id
  );
  const logsFilteredByPlayer2 = filterTimeLogsByPlayerId(
    timeLogs,
    selectedPlayer2Id
  );

  const player1logsSortedByHeatAndTime = sortTimeLogsByHeat(
    sortTimeLogsByTime(logsFilteredByPlayer1)
  );
  const player2logsSortedByHeatAndTime = sortTimeLogsByHeat(
    sortTimeLogsByTime(logsFilteredByPlayer2)
  );

  const player1BeerLogs = player1logsSortedByHeatAndTime.filter(
    (log) => log.time_type_id === beerTypeId
  );
  const player1SpinnerLogs = player1logsSortedByHeatAndTime.filter(
    (log) => log.time_type_id === spinnerId
  );
  const player1SailLogs = player1logsSortedByHeatAndTime.filter(
    (log) => log.time_type_id === sailId
  );

  const player2BeerLogs = player2logsSortedByHeatAndTime.filter(
    (log) => log.time_type_id === beerTypeId
  );
  const player2SpinnerLogs = player2logsSortedByHeatAndTime.filter(
    (log) => log.time_type_id === spinnerId
  );
  const player2SailLogs = player2logsSortedByHeatAndTime.filter(
    (log) => log.time_type_id === sailId
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
    selectedPlayer1Id,
    player1BestTimes,
    players,
    PERFORMANCE_SCALES,
    [TIME_TYPE_BEER, TIME_TYPE_SPIN, TIME_TYPE_SAIL]
  );

  const player2ChartData = generateRadarChartData(
    selectedPlayer2Id,
    player2BestTimes,
    players,
    PERFORMANCE_SCALES,
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
              {player.name}
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
              {player.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Two radar charts side by side */}
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
          name={player1ChartData.playerName}
          altTextType="Fun Fact"
          altText={player1ChartData.funFact}
          data={player1ChartData.data}
        />

        <RadarChartComponent
          imageUrl={player2ChartData.imageUrl}
          name={player2ChartData.playerName}
          altTextType="Fun Fact"
          altText={player2ChartData.funFact}
          data={player2ChartData.data}
        />
      </Box>

      <Typography variant="body2" color="textSecondary" align="center">
        100% = Excellent performance (under{" "}
        {PERFORMANCE_SCALES.BEER.MIN_TIME / 1000}s beer,{" "}
        {PERFORMANCE_SCALES.SPIN.MIN_TIME / 1000}s spin,{" "}
        {PERFORMANCE_SCALES.SAIL.MIN_TIME / 1000}s sail)
        <br />
        0% = Poor performance (over {PERFORMANCE_SCALES.BEER.MAX_TIME / 1000}s
        beer, {PERFORMANCE_SCALES.SPIN.MAX_TIME / 1000}s spin,{" "}
        {PERFORMANCE_SCALES.SAIL.MAX_TIME / 1000}s sail)
      </Typography>
    </>
  );
};

export default Contestants;
