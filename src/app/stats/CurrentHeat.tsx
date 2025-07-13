"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Avatar,
  Paper,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from "@mui/material";
import { Heat, Player, Team, TimeLog, TimeType } from "@/types";
import {
  getCurrentHeat,
  getTeamPlayer,
  getTeamPlayerIds,
  getTimeTypeBeer,
  getTimeTypeSail,
  getTimeTypeSpinner,
} from "@/utils/getUtils";
import {
  filterTimeLogsByHeatId,
  filterTimeLogsByTeamId,
  filterTimeLogsByTimeType,
  sortTimeLogsByTime,
} from "@/utils/sortFilterUtils";
import { formatTime, timeToMilli } from "@/utils/timeUtils";

interface CurrentHeatProps {
  timeLogs: TimeLog[];
  players: Player[];
  teams: Team[];
  heats: Heat[];
  timeTypes: TimeType[];
  alert: any | null;
}

interface PlayerProgress {
  playerId: number;
  playerName: string;
  sail1stTime: number | null;
  beerTime: number | null;
  spinTime: number | null;
  sail2ndTime: number | null;
  totalTime: number | null;
  currentStage:
    | "waiting"
    | "sailing"
    | "drinking"
    | "spinning"
    | "sailing-back"
    | "finished";
  progress: number; // 0-100%
}

interface TeamData {
  teamId: number;
  teamName: string;
  teamImage?: string;
  players: PlayerProgress[];
  totalProgress: number;
}

const STAGE_LABELS = {
  waiting: "Waiting to Start",
  sailing: "Sailing Out",
  drinking: "Drinking Beer",
  spinning: "Spinning",
  "sailing-back": "Sailing Back",
  finished: "Finished!",
};

const STAGE_COLORS = {
  waiting: "#9e9e9e",
  sailing: "#2196f3",
  drinking: "#ff9800",
  spinning: "#9c27b0",
  "sailing-back": "#4caf50",
  finished: "#4caf50",
};

const CurrentHeat: React.FC<CurrentHeatProps> = ({
  timeLogs = [],
  players = [],
  teams = [],
  heats = [],
  timeTypes = [],
  alert = null,
}) => {
  const [currentHeat, setCurrentHeat] = useState<Heat | null>(null);
  const [teamsData, setTeamsData] = useState<TeamData[]>([]);

  const beerTypeId = getTimeTypeBeer(timeTypes)?.id || 0;
  const spinnerTypeId = getTimeTypeSpinner(timeTypes)?.id || 0;
  const sailTypeId = getTimeTypeSail(timeTypes)?.id || 0;

  useEffect(() => {
    const loadCurrentHeat = async () => {
      const heat = await getCurrentHeat(alert);
      if (heat) {
        setCurrentHeat(heat);
      }
    };
    loadCurrentHeat();
  }, [alert]);

  useEffect(() => {
    if (!currentHeat?.id) return;

    const processHeatData = () => {
      const currentHeatTimeLogs = filterTimeLogsByHeatId(
        timeLogs,
        currentHeat.id
      );
      const teamIds = [
        ...new Set(currentHeatTimeLogs.map((log) => log.team_id)),
      ];
      console.log("Found team IDs:", teamIds);

      const processedTeams: TeamData[] = teamIds
        .filter((teamId): teamId is number => typeof teamId === "number")
        .map((teamId) => {
          const team = teams.find((t) => t.id === teamId);
          const teamLogs = sortTimeLogsByTime(
            filterTimeLogsByTeamId(currentHeatTimeLogs, teamId)
          );

          console.log("Team ID:", teamId);

          const beerLogs = filterTimeLogsByTimeType(teamLogs, beerTypeId);
          const sailLogs = filterTimeLogsByTimeType(teamLogs, sailTypeId);
          const spinLogs = filterTimeLogsByTimeType(teamLogs, spinnerTypeId);

          console.log("\tBeer Logs:", beerLogs);
          console.log("\tSail Logs:", sailLogs);
          console.log("\tSpin Logs:", spinLogs);

          // Process players data - assuming 4 players per team
          const playersData: PlayerProgress[] = [];
          const teamPlayers = getTeamPlayer(teamId, teams, players);

          console.log("\tTeam Players:", teamPlayers);

          teamPlayers.forEach((player, index) => {
            // Calculate indices based on race progression
            const sail1stIndex = index * 2 + 1;
            const beerIndex = index * 2 + 1;
            const spinIndex = index * 2 + 1;
            const sail2ndIndex = index * 2 + 2;

            const sail1stTime = sailLogs[sail1stIndex]?.time || null;
            console.log("\tSail 1st Time:", sail1stTime);
            const beerTime = beerLogs[beerIndex]?.time || null;
            const spinTime = spinLogs[spinIndex]?.time || null;
            const sail2ndTime = sailLogs[sail2ndIndex]?.time || null;

            // Calculate progress and current stage
            let currentStage: PlayerProgress["currentStage"] = "waiting";
            let progress = 0;

            if (sail2ndTime) {
              currentStage = "finished";
              progress = 100;
            } else if (spinTime) {
              currentStage = "sailing-back";
              progress = 75;
            } else if (beerTime) {
              currentStage = "spinning";
              progress = 50;
            } else if (sail1stTime) {
              currentStage = "drinking";
              progress = 25;
            } else {
              const hasStarted = sailLogs.some(
                (log) => log.player_id === player.id
              );
              if (hasStarted) {
                currentStage = "sailing";
                progress = 12.5;
              }
            }

            console.log("Log time: ", sail1stTime);

            const sail1stTimeMilli = timeToMilli(sail1stTime || "00:00:00.000");
            const beerTimeMilli = timeToMilli(beerTime || "00:00:00.000");
            const spinTimeMilli = timeToMilli(spinTime || "00:00:00.000");
            const sail2ndTimeMilli = timeToMilli(sail2ndTime || "00:00:00.000");
            const totalTimeMilli = timeToMilli(sail2ndTime || "00:00:00.000");

            playersData.push({
              playerId: player.id,
              playerName: player.name,
              sail1stTime: sail1stTimeMilli,
              beerTime: beerTimeMilli,
              spinTime: spinTimeMilli,
              sail2ndTime: sail2ndTimeMilli,
              totalTime: totalTimeMilli,
              currentStage,
              progress,
            });
          });

          const totalProgress =
            playersData.reduce((sum, p) => sum + p.progress, 0) /
            playersData.length;

          return {
            teamId,
            teamName: team?.name || `Team ${teamId}`,
            teamImage: team?.image_url,
            players: playersData,
            totalProgress,
          };
        });

      setTeamsData(
        processedTeams.sort((a, b) => b.totalProgress - a.totalProgress)
      );
    };

    processHeatData();
  }, [
    currentHeat,
    timeLogs,
    players,
    teams,
    beerTypeId,
    spinnerTypeId,
    sailTypeId,
  ]);

  if (!currentHeat) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5">No active heat found</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Current Heat Progress
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Heat #{currentHeat.heat} -{" "}
        {new Date(currentHeat.date).toLocaleTimeString()}
      </Typography>

      {teamsData.map((teamData, teamIndex) => (
        <Card key={teamData.teamId} elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            {/* Team Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {teamData.teamImage && (
                <Avatar
                  src={teamData.teamImage}
                  alt={teamData.teamName}
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div">
                  {teamData.teamName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall Progress: {teamData.totalProgress.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={teamData.totalProgress}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="h4" color="primary">
                #{teamIndex + 1}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Players Progress */}
            {teamData.players.map((player, playerIndex) => (
              <Box key={player.playerId} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6" sx={{ minWidth: 200 }}>
                    {player.playerName}
                  </Typography>
                  <Chip
                    label={STAGE_LABELS[player.currentStage]}
                    size="small"
                    sx={{
                      backgroundColor: STAGE_COLORS[player.currentStage],
                      color: "white",
                      mr: 2,
                    }}
                  />
                  {player.totalTime && (
                    <Typography variant="h6" color="primary">
                      {formatTime(player.totalTime)}
                    </Typography>
                  )}
                </Box>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={player.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: STAGE_COLORS[player.currentStage],
                    },
                  }}
                />

                {/* Stage Times */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                    fontSize: "0.75rem",
                  }}
                >
                  <Typography
                    variant="caption"
                    color={player.sail1stTime ? "primary" : "text.disabled"}
                  >
                    Sail:{" "}
                    {player.sail1stTime ? formatTime(player.sail1stTime) : "--"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={player.beerTime ? "primary" : "text.disabled"}
                  >
                    Beer: {player.beerTime ? formatTime(player.beerTime) : "--"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={player.spinTime ? "primary" : "text.disabled"}
                  >
                    Spin: {player.spinTime ? formatTime(player.spinTime) : "--"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={player.sail2ndTime ? "primary" : "text.disabled"}
                  >
                    Return:{" "}
                    {player.sail2ndTime ? formatTime(player.sail2ndTime) : "--"}
                  </Typography>
                </Box>

                {playerIndex < teamData.players.length - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}

      {teamsData.length === 0 && (
        <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
          <Typography>No data available for current heat</Typography>
        </Paper>
      )}
    </>
  );
};

export default CurrentHeat;
