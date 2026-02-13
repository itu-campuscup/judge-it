"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, Stack } from "@mui/material";
import AlertComponent from "../components/AlertComponent";
import {
  getPlayerName,
  getCurrentHeat,
  getPrevPlayerId,
  getTimeType,
} from "@/utils/getUtils";
import { TIME_TYPE_SAIL } from "@/utils/constants";
import type {
  Team,
  Player,
  TimeType,
  TimeLog,
  Heat,
  AlertContext,
  AlertObject,
} from "@/types";
import { Id } from "convex/_generated/dataModel";

interface ParticipantsJudgeProps {
  selectedTeam: Team | null;
  selectedPlayer: Player | null;
  heats: Heat[];
  timeTypes?: TimeType[];
  players?: Player[];
  timeLogs?: TimeLog[];
  alert: AlertObject;
}

const ParticipantsJudge: React.FC<ParticipantsJudgeProps> = ({
  selectedTeam,
  selectedPlayer,
  heats,
  timeTypes = [],
  players = [],
  timeLogs = [],
  alert,
}) => {
  const createTimeLog = useMutation(api.mutations.createTimeLog);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<"error" | "success">(
    "error",
  );
  const [alertText, setAlertText] = useState<string>("");
  const [alertContext, setAlertContext] = useState<AlertContext | undefined>();
  const [currentHeat, setCurrentHeat] = useState<Heat | null>(null);
  const playerName = getPlayerName(selectedPlayer?.id || 0, players);

  useEffect(() => {
    const loadCurrentHeat = async () => {
      const some = getCurrentHeat(heats, alert);
      setCurrentHeat(some);
    };
    loadCurrentHeat();
  }, [timeLogs]);
  const prevPlayerId = currentHeat
    ? getPrevPlayerId(selectedTeam?.id || 0, currentHeat, timeLogs)
    : "No previous player";
  const prevPlayerName =
    typeof prevPlayerId === "number"
      ? getPlayerName(prevPlayerId, players)
      : prevPlayerId;
  const handleStartStop = async (playerId: number | string | null) => {
    if (!playerId || !currentHeat) {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText("Missing player ID or current heat");
      setAlertContext({
        operation: "start_stop_timer",
        location: "ParticipantsJudge.handleStartStop",
        metadata: {
          missingField: !playerId ? "playerId" : "currentHeat",
          selectedTeamId: selectedTeam?.id,
          selectedPlayerId: selectedPlayer?.id,
        },
      });
      return;
    }

    const timeTypeId = getTimeType(TIME_TYPE_SAIL, timeTypes)?.id;
    if (!timeTypeId) {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText("Could not find sailing time type");
      setAlertContext({
        operation: "start_stop_timer",
        location: "ParticipantsJudge.handleStartStop",
        metadata: {
          searchingFor: TIME_TYPE_SAIL,
          availableTimeTypes: timeTypes.map((t) => t.time_eng),
        },
      });
      return;
    }

    try {
      // Get current time
      const now = new Date();
      const timeSeconds =
        now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const timeString = now.toLocaleTimeString("en-GB", { hour12: false });

      // Insert both time logs (stop previous player, start new player)
      await createTimeLog({
        team_id: selectedTeam?.id as Id<"teams"> | undefined,
        player_id: prevPlayerId as Id<"players">,
        time_type_id: timeTypeId as unknown as Id<"time_types">,
        heat_id: currentHeat.id.toString() as Id<"heats">,
        time_seconds: timeSeconds,
        time: timeString,
      });

      await createTimeLog({
        team_id: selectedTeam?.id as Id<"teams"> | undefined,
        player_id: (typeof playerId === "string"
          ? parseInt(playerId)
          : playerId) as unknown as Id<"players">,
        time_type_id: timeTypeId as unknown as Id<"time_types">,
        heat_id: currentHeat.id as unknown as Id<"heats">,
        time_seconds: timeSeconds,
        time: timeString,
      });
    } catch (error) {
      const err = "Error inserting time log: " + (error as Error).message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      setAlertContext({
        operation: "start_stop_timer",
        location: "ParticipantsJudge.handleStartStop",
        metadata: {
          step: "insert_time_logs",
          teamId: selectedTeam?.id,
          prevPlayerId,
          currentPlayerId: playerId,
          heatId: currentHeat.id,
        },
      });
      return;
    }
    setAlertOpen(true);
    setAlertSeverity("success");
    setAlertText(
      "Inserted log of type: " +
        (timeTypes.find((e) => e.id === timeTypeId)?.time_eng || "Unknown"),
    );
    setAlertContext({
      operation: "start_stop_timer",
      location: "ParticipantsJudge.handleStartStop",
      metadata: {
        teamId: selectedTeam?.id,
        prevPlayerId,
        currentPlayerId: playerId,
        heatId: currentHeat.id,
        timeType: TIME_TYPE_SAIL,
      },
    });
  };

  return (
    <>
      <AlertComponent
        open={alertOpen}
        severity={alertSeverity}
        text={alertText}
        context={alertContext}
        setOpen={setAlertOpen}
      />
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          fullWidth
          sx={{
            minHeight: 80,
            fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
            padding: 2,
          }}
          onClick={() => handleStartStop(prevPlayerId)}
        >
          STOP {prevPlayerName} {TIME_TYPE_SAIL}
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{
            minHeight: 80,
            fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
            padding: 2,
          }}
          onClick={() => handleStartStop(selectedPlayer?.id || null)}
        >
          Stop prev and Start {playerName} {TIME_TYPE_SAIL}
        </Button>
      </Stack>
    </>
  );
};

export default ParticipantsJudge;
