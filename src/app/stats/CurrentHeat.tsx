"use client";

import React, { useState, useEffect } from "react";
import { Typography, Box, Avatar, Paper } from "@mui/material";
import { Heat, Player, Team, TimeLog, TimeType } from "@/types";
import {
  getCurrentHeat,
  getTeamPlayer,
  getTimeTypeSail,
} from "@/utils/getUtils";
import {
  filterTimeLogsByHeatId,
  filterTimeLogsByTimeType,
  sortTimeLogsByTime,
} from "@/utils/sortFilterUtils";
import { timeToMilli, formatTime, calcTimeDifference } from "@/utils/timeUtils";

interface CurrentHeatProps {
  timeLogs: TimeLog[];
  players: Player[];
  teams: Team[];
  heats: Heat[];
  timeTypes: TimeType[];
  alert: any | null;
}

interface TeamData {
  teamId: number;
  teamName: string;
  teamImage?: string;
  currentPlayer: Player | null;
  sailCount: number;
  isFinished: boolean;
}

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
  const [raceTimer, setRaceTimer] = useState<string>("00:00");
  const [raceStartTime, setRaceStartTime] = useState<string | null>(null);
  const [raceFinished, setRaceFinished] = useState<boolean>(false);

  const sailTypeId = getTimeTypeSail(timeTypes)?.id || 0;

  useEffect(() => {
    const loadCurrentHeat = async () => {
      const heat = await getCurrentHeat(alert);
      if (heat) {
        setCurrentHeat(heat);
      }
    };
    loadCurrentHeat();
  }, [heats, alert]);

  // Reset timer state when heat changes
  useEffect(() => {
    if (currentHeat) {
      setRaceTimer("00:00");
      setRaceStartTime(null);
      setRaceFinished(false);
      setTeamsData([]);
    }
  }, [currentHeat?.id]);

  // Race timer effect
  useEffect(() => {
    if (!raceStartTime || raceFinished) return;

    const timer = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, "0")}`;

      const elapsedMs = calcTimeDifference(raceStartTime, currentTime);
      const formatted = formatTime(elapsedMs);
      const parts = formatted.split(":");
      if (parts.length >= 2) {
        const minutes = parseInt(parts[0], 10) % 60;
        setRaceTimer(`${minutes.toString().padStart(2, "0")}:${parts[1]}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [raceStartTime, raceFinished]);

  useEffect(() => {
    if (!currentHeat?.id) return;

    const processHeatData = () => {
      const currentHeatTimeLogs = filterTimeLogsByHeatId(
        timeLogs,
        currentHeat.id
      );

      // Only work with sail logs - ignore beer and spin completely
      const allSailLogs = filterTimeLogsByTimeType(
        currentHeatTimeLogs,
        sailTypeId
      );

      // Check if any team has reached 16 sail logs
      const teamIds = [...new Set(allSailLogs.map((log) => log.team_id))];
      let raceComplete = false;
      let winningTeamId: number | null = null;

      for (const teamId of teamIds) {
        if (typeof teamId === "number") {
          const teamSailLogs = allSailLogs.filter(
            (log) => log.team_id === teamId
          );
          if (teamSailLogs.length >= 16) {
            raceComplete = true;
            winningTeamId = teamId;
            break;
          }
        }
      }

      // Set race finished if any team reaches 16 sail logs
      if (raceComplete && !raceFinished) {
        setRaceFinished(true);
      }

      // Calculate final time from when winning team got their 16th sail log
      let finalTime: string | null = null;
      if (raceComplete && winningTeamId) {
        const winningSailLogs = allSailLogs.filter(
          (log) => log.team_id === winningTeamId
        );
        if (winningSailLogs.length >= 16) {
          const sortedWinningSailLogs = sortTimeLogsByTime(winningSailLogs);
          const sixteenthSailLog = sortedWinningSailLogs[15]; // 16th log (0-indexed)
          const firstSailLog = sortTimeLogsByTime(allSailLogs)[0]; // First sail log of the race

          if (firstSailLog?.time && sixteenthSailLog?.time) {
            const elapsedMs = calcTimeDifference(
              firstSailLog.time,
              sixteenthSailLog.time
            );
            const formatted = formatTime(elapsedMs);
            const parts = formatted.split(":");
            if (parts.length >= 2) {
              const minutes = parseInt(parts[0], 10) % 60;
              finalTime = `${minutes.toString().padStart(2, "0")}:${parts[1]}`;
            }
          }
        }
      }

      // Set race start time from first sail log
      if (allSailLogs.length > 0 && !raceStartTime) {
        const firstSailLog = sortTimeLogsByTime(allSailLogs)[0];
        if (firstSailLog?.time) {
          setRaceStartTime(firstSailLog.time);
        }
      }

      const processedTeams: TeamData[] = teamIds
        .filter((teamId): teamId is number => typeof teamId === "number")
        .map((teamId) => {
          const team = teams.find((t) => t.id === teamId);
          const teamPlayers = getTeamPlayer(teamId, teams, players);

          // Get only sail logs for this team
          const teamSailLogs = allSailLogs.filter(
            (log) => log.team_id === teamId
          );
          const sailCount = teamSailLogs.length;

          // Find current player based on most recent sail log
          let currentPlayer: Player | null = null;
          if (teamSailLogs.length > 0) {
            const sortedSailLogs = sortTimeLogsByTime(teamSailLogs);
            const mostRecentSailLog = sortedSailLogs[sortedSailLogs.length - 1];
            currentPlayer =
              teamPlayers.find((p) => p.id === mostRecentSailLog.player_id) ||
              teamPlayers[0] ||
              null;
          } else {
            currentPlayer = teamPlayers[0] || null;
          }

          return {
            teamId,
            teamName: team?.name || `Team ${teamId}`,
            teamImage: team?.image_url,
            currentPlayer,
            sailCount,
            isFinished: raceComplete,
          };
        });

      setTeamsData(processedTeams);

      // Update timer display with final time if race is finished
      if (raceComplete && finalTime) {
        setRaceTimer(finalTime);
      }
    };

    processHeatData();
  }, [
    timeLogs,
    currentHeat,
    teams,
    players,
    timeTypes,
    raceStartTime,
    raceFinished,
  ]);

  if (!currentHeat) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h4">No heat selected</Typography>
      </Box>
    );
  }

  const team1 = teamsData[0];
  const team2 = teamsData[1];

  let winningTeam: TeamData | null = null;
  if (team1 && team2) {
    // Get all sail logs for the current heat
    const currentHeatTimeLogs = filterTimeLogsByHeatId(
      timeLogs,
      currentHeat.id
    );
    const allSailLogs = filterTimeLogsByTimeType(
      currentHeatTimeLogs,
      sailTypeId
    );

    // Check if either team has 16+ sail logs
    const team1SailLogs = allSailLogs.filter(
      (log) => log.team_id === team1.teamId
    );
    const team2SailLogs = allSailLogs.filter(
      (log) => log.team_id === team2.teamId
    );

    // If either team has 16+ logs, determine who got their 16th log first
    if (team1SailLogs.length >= 16 || team2SailLogs.length >= 16) {
      let team1SixteenthTime: string | null = null;
      let team2SixteenthTime: string | null = null;

      // Get 16th log time for team1 if they have 16+ logs
      if (team1SailLogs.length >= 16) {
        const sortedTeam1Logs = sortTimeLogsByTime(team1SailLogs);
        team1SixteenthTime = sortedTeam1Logs[15]?.time || null; // 16th log (0-indexed)
      }

      // Get 16th log time for team2 if they have 16+ logs
      if (team2SailLogs.length >= 16) {
        const sortedTeam2Logs = sortTimeLogsByTime(team2SailLogs);
        team2SixteenthTime = sortedTeam2Logs[15]?.time || null; // 16th log (0-indexed)
      }

      // Determine winner based on who got 16th log first
      if (team1SixteenthTime && team2SixteenthTime) {
        // Both teams finished - compare times
        const team1Time = timeToMilli(team1SixteenthTime);
        const team2Time = timeToMilli(team2SixteenthTime);
        winningTeam = team1Time <= team2Time ? team1 : team2;
      } else if (team1SixteenthTime) {
        // Only team1 finished
        winningTeam = team1;
      } else if (team2SixteenthTime) {
        // Only team2 finished
        winningTeam = team2;
      }
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "70vh",
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
        🔥 Heat #{currentHeat?.heat ?? "🙈"}
      </Typography>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: 0,
        }}
      >
        {/* Team 1 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            position: "relative",
          }}
        >
          {winningTeam?.teamId === team1?.teamId && (
            <Typography variant="h1" sx={{ fontSize: "3rem", mb: 1 }}>
              👑
            </Typography>
          )}
          {team1 && (
            <>
              <Avatar
                src={team1.teamImage}
                sx={{ width: 160, height: 160, mb: 3 }}
              />
              <Typography
                variant="h2"
                sx={{
                  mb: 2,
                  textAlign: "center",
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                }}
              >
                {team1.teamName}
              </Typography>
              <Typography
                variant="h3"
                color="text.secondary"
                sx={{
                  textAlign: "center",
                  fontSize: "2rem",
                }}
              >
                {team1.currentPlayer?.name || "No player"}
              </Typography>
            </>
          )}
        </Box>

        {/* Timer in the middle */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Typography
            variant="h1"
            sx={{ fontWeight: "bold", mb: 2, fontSize: "3.5rem" }}
          >
            {raceTimer}
          </Typography>
          {raceFinished && (
            <Typography variant="h4" color="success.main">
              Final Time!
            </Typography>
          )}
        </Box>

        {/* Team 2 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            position: "relative",
          }}
        >
          {winningTeam?.teamId === team2?.teamId && (
            <Typography variant="h1" sx={{ fontSize: "3rem", mb: 1 }}>
              👑
            </Typography>
          )}
          {team2 && (
            <>
              <Avatar
                src={team2.teamImage}
                sx={{ width: 160, height: 160, mb: 3 }}
              />
              <Typography
                variant="h2"
                sx={{
                  mb: 2,
                  textAlign: "center",
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                }}
              >
                {team2.teamName}
              </Typography>
              <Typography
                variant="h3"
                color="text.secondary"
                sx={{
                  textAlign: "center",
                  fontSize: "2rem",
                }}
              >
                {team2.currentPlayer?.name || "No player"}
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CurrentHeat;
