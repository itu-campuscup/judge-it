"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import { Button, Box } from "@mui/material";
import AlertComponent from "../components/AlertComponent";
import styles from "@/app/page.module.css";
import {
  getPlayerName,
  getCurrentHeat,
  getPrevPlayerId,
  getTimeType,
} from "@/utils/getUtils";
import {
  HEATS_TABLE,
  TIME_LOGS_TABLE,
  TIME_TYPE_SAIL,
} from "@/utils/constants";
import type { Team, Player, TimeType, TimeLog, Heat } from "@/types";

interface ParticipantsJudgeProps {
  selectedTeam: Team | null;
  selectedPlayer: Player | null;
  timeTypes?: TimeType[];
  players?: Player[];
  timeLogs?: TimeLog[];
  alert: any;
}

const ParticipantsJudge: React.FC<ParticipantsJudgeProps> = ({
  selectedTeam,
  selectedPlayer,
  timeTypes = [],
  players = [],
  timeLogs = [],
  alert,
}) => {
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<"error" | "success">(
    "error"
  );
  const [alertText, setAlertText] = useState<string>("");
  const [currentHeat, setCurrentHeat] = useState<Heat | null>(null);
  console.log("ParticipantsJudge - selectedPlayer: ", selectedPlayer);
  const playerName = getPlayerName(selectedPlayer?.id || 0, players);
  console.log("Players: ", players);
  console.log("Selected player: ", playerName);

  useEffect(() => {
    const loadCurrentHeat = async () => {
      const some = await getCurrentHeat(alert);
      console.log("Current heat: ", some);
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
  console.log("Current heat: ", currentHeat);
  console.log("Prev player: ", prevPlayerId);
  const handleStartStop = async (playerId: number | string | null) => {
    if (!playerId || !currentHeat) {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText("Missing player ID or current heat");
      return;
    }

    const timeTypeId = getTimeType(TIME_TYPE_SAIL, timeTypes)?.id;
    if (!timeTypeId) {
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText("Could not find sailing time type");
      return;
    }

    const { data, error } = await supabase.from(TIME_LOGS_TABLE).insert([
      {
        team_id: selectedTeam?.id,
        player_id: prevPlayerId,
        time_type_id: timeTypeId,
        heat_id: currentHeat.id,
      },
      {
        team_id: selectedTeam?.id,
        player_id: typeof playerId === "string" ? parseInt(playerId) : playerId,
        time_type_id: timeTypeId,
        heat_id: currentHeat.id,
      },
    ]);
    if (error) {
      const err = "Error inserting time log: " + error.message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      console.error(err);
      return;
    }
    setAlertOpen(true);
    setAlertSeverity("success");
    setAlertText(
      "Inserted log of type: " +
        (timeTypes.find((e) => e.id === timeTypeId)?.time_eng || "Unknown")
    );
  };

  return (
    <>
      <AlertComponent
        open={alertOpen}
        severity={alertSeverity}
        text={alertText}
        setOpen={setAlertOpen}
      />
      <Box className={styles.timeTypeButtonContainer}>
        <Button
          variant="contained"
          color="primary"
          className={styles.timeTypeButton}
          onClick={() => handleStartStop(prevPlayerId)}
        >
          STOP {prevPlayerName} {TIME_TYPE_SAIL}
        </Button>
        <Button
          variant="contained"
          color="primary"
          className={styles.timeTypeButton}
          onClick={() => handleStartStop(selectedPlayer?.id || null)}
        >
          Start {playerName} {TIME_TYPE_SAIL}
        </Button>
      </Box>
    </>
  );
};

export default ParticipantsJudge;
