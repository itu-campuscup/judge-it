"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button, Stack } from "@mui/material";
import AlertComponent from "../components/AlertComponent";
import {
  getPlayerName,
  getCurrentHeat,
  getPrevPlayerId,
  getTimeType,
} from "@/utils/getUtils";
import { TIME_TYPE_SAIL } from "@/utils/constants";
import type { Team, Player, Heat, AlertContext, AlertSeverity } from "@/types";
import { Id } from "convex/_generated/dataModel";
import useFetchDataConvex from "../hooks/useFetchDataConvex";

interface ParticipantsJudgeProps {
  selectedTeam: Team | null;
  selectedPlayer: Player | null;
}

const ParticipantsJudge: React.FC<ParticipantsJudgeProps> = ({
  selectedTeam,
  selectedPlayer,
}) => {
  const { alert, heats, players, timeTypes, timeLogs } = useFetchDataConvex();
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>("error");
  const createTimeLogsBatch = useMutation(api.mutations.createTimeLogsBatch);
  const [alertText, setAlertText] = useState<string>("");
  const [alertContext, setAlertContext] = useState<AlertContext | undefined>();
  const [currentHeat, setCurrentHeat] = useState<Heat | null>(null);
  const playerName = getPlayerName(selectedPlayer?.id || null, players);

  useEffect(() => {
    const loadCurrentHeat = async () => {
      const some = getCurrentHeat(heats, alert);
      setCurrentHeat(some);
    };
    loadCurrentHeat();
  }, [timeLogs]);
  const prevPlayerId = currentHeat
    ? getPrevPlayerId(selectedTeam?.id || null, currentHeat, timeLogs)
    : '"No previous player"';
  const prevPlayerName =
    prevPlayerId && prevPlayerId !== '"No previous player"'
      ? getPlayerName(prevPlayerId, players)
      : (prevPlayerId as string);
  const handleStartStop = async (playerId: string | null) => {
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
      await createTimeLogsBatch({
        logs: [
          {
            team_id: selectedTeam?.id,
            player_id: prevPlayerId as Id<"players">,
            time_type_id: timeTypeId,
            heat_id: currentHeat.id,
          },
          {
            team_id: selectedTeam?.id,
            player_id: playerId as Id<"players">,
            time_type_id: timeTypeId,
            heat_id: currentHeat.id,
          },
        ],
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
