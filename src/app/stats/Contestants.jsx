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
  splitTimeLogsPerHeat,
} from "@/utils/sortFilterUtils";
import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

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

  const player1BestIntraHeatBeerTime = getBestIntraHeatTime(player1BeerLogs);
  const player1BestIntraHeatSpinTime = getBestIntraHeatTime(player1SpinnerLogs);
  const player1BestIntraHeatSailTime = getBestIntraHeatTime(player1SailLogs);

  const player2BestIntraHeatBeerTime = getBestIntraHeatTime(player2BeerLogs);
  const player2BestIntraHeatSpinTime = getBestIntraHeatTime(player2SpinnerLogs);
  const player2BestIntraHeatSailTime = getBestIntraHeatTime(player2SailLogs);

  console.log("P1 Beer", player1BestIntraHeatBeerTime);
  console.log("P1 Spin", player1BestIntraHeatSpinTime);
  console.log("P1 Sail", player1BestIntraHeatSailTime);

  console.log("P2 Beer", player2BestIntraHeatBeerTime);
  console.log("P2 Spin", player2BestIntraHeatSpinTime);
  console.log("P2 Sail", player2BestIntraHeatSailTime);

  const allTimes = [
    player1BestIntraHeatBeerTime,
    player1BestIntraHeatSpinTime,
    player1BestIntraHeatSailTime,
    player2BestIntraHeatBeerTime,
    player2BestIntraHeatSpinTime,
    player2BestIntraHeatSailTime
  ].filter(time => time > 0);

  const bestBeerTime = Math.min(
    player1BestIntraHeatBeerTime > 0 ? players1BestIntraHeatBeerTime : Infinity,
    player2BestIntraHeatBeerTime > 0 ? player2BestIntraHeatBeerTime : Infinity
  );
  const worstBeerTime = Math.max(
    player1BestIntraHeatBeerTime,
    player2BestIntraHeatBeerTime
  );
  const bestSpinTime = Math.min(
    player1BestIntraHeatSpinTime > 0 ? player1BestIntraHeatSpinTime : Infinity,
    player2BestIntraHeatSpinTime > 0 ? player2BestIntraHeatSpinTime : Infinity
  );
  const worstSpinTime = Math.max(
    player1BestIntraHeatSpinTime,
    player2BestIntraHeatSpinTime
  );
  const bestSailTime = Math.min(
    player1BestIntraHeatSailTime > 0 ? player1BestIntraHeatSailTime : Infinity,
    player2BestIntraHeatSailTime > 0 ? player2BestIntraHeatSailTime : Infinity
  );
  const worstSailTime = Math.max(
    player1BestIntraHeatSailTime,
    player2BestIntraHeatSailTime
  );

  const timeToPercentage = (time, bestTime, worstTime) => {
    if (time <= 0 || bestTime <= 0 || worstTime <= 0) return 0;
    if (bestTime === worstTime) return 100;
    if (bestTime === Infinity) return 0;

    return Math.round(100 - ((time - bestTime) / (worstTime - bestTime)) * 100);
  };

  const player1Name = getPlayerName(selectedPlayer1Id, players);
  const player2Name = getPlayerName(selectedPlayer2Id, players);

  const player1Data = [
    {
      subject: TIME_TYPE_BEER,
      Performance: timeToPercentage(
        player1BestIntraHeatBeerTime,
        bestBeerTime,
        worstBeerTime
      ),
      fullMark: 100,
    },
    {
      subject: TIME_TYPE_SPIN,
      Performance: timeToPercentage(
        player1BestIntraHeatSpinTime,
        bestSpinTime,
        worstSpinTime
      ),
      fullMark: 100,
    },
    {
      subject: TIME_TYPE_SAIL,
      Performance: timeToPercentage(
        player1BestIntraHeatSailTime,
        bestSailTime,
        worstSailTime
      ),
      fullMark: 100,
    },
  ];

  const player2Data = [
    {
      subject: TIME_TYPE_BEER,
      Performance: timeToPercentage(
        player2BestIntraHeatBeerTime,
        bestBeerTime,
        worstBeerTime
      ),
      fullMark: 100,
    },
    {
      subject: TIME_TYPE_SPIN,
      Performance: timeToPercentage(
        player2BestIntraHeatSpinTime,
        bestSpinTime,
        worstSpinTime
      ),
      fullMark: 100,
    },
    {
      subject: TIME_TYPE_SAIL,
      Performance: timeToPercentage(
        player2BestIntraHeatSailTime,
        bestSailTime,
        worstSailTime
      ),
      fullMark: 100,
    },
  ];

  console.log("Player 1 Data:", player1Data);
  console.log("Player 2 Data:", player2Data);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Contestant Stats
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
      <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center", my: 4, flexWrap: "wrap" }}>
        {/* Player 1 Chart */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {player1Name}
          </Typography>
          <RadarChart
            cx={200}
            cy={150}
            outerRadius={120}
            width={400}
            height={300}
            data={player1Data}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Radar
              name="Performance"
              dataKey="Performance"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </Box>

        {/* Player 2 Chart */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {player2Name}
          </Typography>
          <RadarChart
            cx={200}
            cy={150}
            outerRadius={120}
            width={400}
            height={300}
            data={player2Data}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Radar
              name="Performance"
              dataKey="Performance"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
          </RadarChart>
        </Box>
      </Box>

      <Typography variant="body2" color="textSecondary" align="center">
        100% = Best time between the two players | 0% = Worst time between the two players
      </Typography>
    </>
  );
};

export default Contestants;
