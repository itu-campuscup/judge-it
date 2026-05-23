"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Typography, Box, Avatar } from "@mui/material";
import { Player } from "@/types";
import {
  getCurrentHeat,
  getCurrentPlayer,
  getTeamPlayer,
  getTimeTypeSail,
} from "@/utils/getUtils";
import {
  filterTimeLogsByHeatId,
  filterTimeLogsByTimeType,
  sortTimeLogsByTime,
} from "@/utils/sortFilterUtils";
import { timeToMilli, formatTime, calcTimeDifference } from "@/utils/timeUtils";
import { Id } from "convex/_generated/dataModel";
import useFetchDataConvex from "../hooks/useFetchDataConvex";

interface TeamData {
  teamId: Id<"teams">;
  teamName: string;
  teamImage?: string;
  currentPlayer: Player | null;
  sailCount: number;
  isFinished: boolean;
}

const CurrentHeat: React.FC = () => {
  const { alert, heats, players, teams, timeLogs, timeTypes } =
    useFetchDataConvex();

  const sailTypeId = useMemo(
    () => getTimeTypeSail(timeTypes)?.id || "",
    [timeTypes],
  );

  // Performance Optimization: Convert currentHeat from useState to useMemo
  // to avoid extra render cycles when heats update.
  const currentHeat = useMemo(
    () => getCurrentHeat(heats, alert || undefined),
    [heats, alert],
  );

  // Performance Optimization: Consolidate all derived heat data into a single useMemo.
  // This avoids redundant O(N) operations and prevents multiple state updates
  // that cause extra re-renders.
  const processedData = useMemo(() => {
    if (!currentHeat?.id) return null;

    const currentHeatTimeLogs = filterTimeLogsByHeatId(
      timeLogs,
      currentHeat.id,
    );
    const allSailLogs = filterTimeLogsByTimeType(
      currentHeatTimeLogs,
      sailTypeId as Id<"time_types">,
    );

    // Performance Optimization: Group sail logs by team_id in a single pass O(N)
    const logsByTeam = new Map<Id<"teams">, typeof allSailLogs>();
    allSailLogs.forEach((log) => {
      if (!log.team_id) return;
      const teamLogs = logsByTeam.get(log.team_id) || [];
      teamLogs.push(log);
      logsByTeam.set(log.team_id, teamLogs);
    });

    const teamIds = Array.from(logsByTeam.keys());
    let raceFinished = false;
    let winningTeamId: Id<"teams"> | null = null;

    for (const teamId of teamIds) {
      const teamSailLogs = logsByTeam.get(teamId) || [];
      if (teamSailLogs.length >= 16) {
        raceFinished = true;
        winningTeamId = teamId;
        break;
      }
    }

    const sortedAllSailLogs =
      allSailLogs.length > 0 ? sortTimeLogsByTime(allSailLogs) : [];
    const raceStartTime = sortedAllSailLogs[0]?.time || null;

    // Calculate final time from when winning team got their 16th sail log
    let finalTimeStr = "00:00";
    if (raceFinished && winningTeamId) {
      const winningSailLogs = logsByTeam.get(winningTeamId) || [];
      if (winningSailLogs.length >= 16) {
        const sortedWinningSailLogs = sortTimeLogsByTime(winningSailLogs);
        const sixteenthSailLog = sortedWinningSailLogs[15];
        const firstSailLog = sortedAllSailLogs[0];

        if (firstSailLog?.time && sixteenthSailLog?.time) {
          const elapsedMs = calcTimeDifference(
            firstSailLog.time,
            sixteenthSailLog.time,
          );
          const formatted = formatTime(elapsedMs);
          const parts = formatted.split(":");
          if (parts.length >= 2) {
            const minutes = parseInt(parts[0], 10) % 60;
            finalTimeStr = `${minutes.toString().padStart(2, "0")}:${parts[1]}`;
          }
        }
      }
    }

    // Pre-calculate lookup Map for teams for O(1) access
    const teamsMap = new Map<Id<"teams">, (typeof teams)[0]>();
    teams.forEach((t) => teamsMap.set(t.id, t));

    const teamsData: TeamData[] = teamIds.map((teamId) => {
      const team = teamsMap.get(teamId);
      const teamPlayers = getTeamPlayer(teamId, teams, players);
      const teamSailLogs = logsByTeam.get(teamId) || [];

      return {
        teamId,
        teamName: team?.name || `Team ${teamId}`,
        teamImage: team?.image_url,
        currentPlayer: getCurrentPlayer(teamSailLogs, teamPlayers),
        sailCount: teamSailLogs.length,
        isFinished: raceFinished,
      };
    });

    // Determine winning team based on who reached 16 logs first
    let winningTeam: TeamData | null = null;
    if (raceFinished && teamsData.length >= 2) {
      const t1 = teamsData[0];
      const t2 = teamsData[1];
      const t1Logs = logsByTeam.get(t1.teamId) || [];
      const t2Logs = logsByTeam.get(t2.teamId) || [];

      if (t1Logs.length >= 16 && t2Logs.length >= 16) {
        const t1Time = timeToMilli(sortTimeLogsByTime(t1Logs)[15]?.time || "");
        const t2Time = timeToMilli(sortTimeLogsByTime(t2Logs)[15]?.time || "");
        winningTeam = t1Time <= t2Time ? t1 : t2;
      } else if (t1Logs.length >= 16) {
        winningTeam = t1;
      } else if (t2Logs.length >= 16) {
        winningTeam = t2;
      }
    }

    return {
      teamsData,
      raceStartTime,
      raceFinished,
      finalTimeStr,
      winningTeam,
    };
  }, [currentHeat?.id, timeLogs, teams, players, sailTypeId]);

  const [raceTimer, setRaceTimer] = useState<string>("00:00");

  // Update timer display when race finishes or state resets
  useEffect(() => {
    if (!processedData || !processedData.raceStartTime) {
      setRaceTimer("00:00");
    } else if (processedData.raceFinished) {
      setRaceTimer(processedData.finalTimeStr);
    }
  }, [processedData]);

  // Race timer effect
  useEffect(() => {
    if (!processedData?.raceStartTime || processedData.raceFinished) return;

    const timer = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, "0")}`;

      const elapsedMs = calcTimeDifference(
        processedData.raceStartTime!,
        currentTime,
      );
      const formatted = formatTime(elapsedMs);
      const parts = formatted.split(":");
      if (parts.length >= 2) {
        const minutes = parseInt(parts[0], 10) % 60;
        setRaceTimer(`${minutes.toString().padStart(2, "0")}:${parts[1]}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [processedData?.raceStartTime, processedData?.raceFinished]);

  const team1 = processedData?.teamsData[0];
  const team2 = processedData?.teamsData[1];
  const winningTeam = processedData?.winningTeam;

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
          {processedData?.raceFinished && (
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
