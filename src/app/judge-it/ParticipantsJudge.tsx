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
  PARTICIPANTS_STATUS_TABLE,
  TIME_LOGS_TABLE,
  TIME_TYPE_SAIL,
} from "@/utils/constants";
import type { Team, Player, TimeType, TimeLog, Heat, participants_status } from "@/types";

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
  const [participants_status, setParticipantsStatus] = useState<participants_status[]>([]);

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
  }, []);
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



  function changeParticipantStatus() {

    console.log("changeParticipantStatus CALLED");

    const fetchParticipantsStatus = async (): Promise<void> => {
      const { data, error } = await supabase.from(PARTICIPANTS_STATUS_TABLE)
        .select("*")
        .eq('status', 'upcoming');


      if (error) {
        const err = "Error fetching participants status:" + error.message;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText(err);
        console.error(err);
      } else {
        setParticipantsStatus(data || []);
      }

      const verification_check = data?.filter((data) => data.team_id !== selectedTeam?.id && data.have_finished === true)
      console.log("Fetched participants status: ", data);

      if (verification_check && verification_check.length > 0) {
        // if the data where not selectedTeam?.id have have_finished=true
        // then change the selectedTeam to status "inactive" and other team to "active". other team have_finished=false
        console.log("Last team have finished, changing status to inactive");

        await supabase
          .from(PARTICIPANTS_STATUS_TABLE)
          .update({ status: 'inactive' })
          .eq("id", selectedTeam?.id);
        await supabase
          .from(PARTICIPANTS_STATUS_TABLE)
          .update({ have_finished: false, status: 'active' })
          .eq("have_finished", true)
      }
      else {
        console.log("First team have finished, changing status to active");

        // else the data where not selectedTeam?.id have have_finished=false
        // then change the selectedTeam to have_finished "true" 
        await supabase
          .from(PARTICIPANTS_STATUS_TABLE)
          .update({ have_finished: "TRUE" })
          .eq("id", selectedTeam?.id);
      }




      const participantsStatusListener = supabase
        .channel("public:participants_status")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: PARTICIPANTS_STATUS_TABLE },
          fetchParticipantsStatus
        )
        .subscribe();

      await supabase.removeChannel(participantsStatusListener);
    }
    fetchParticipantsStatus();

  }


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
          onClick={() => {
            handleStartStop(prevPlayerId)
            changeParticipantStatus()
          }}
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
