import { useState, useEffect } from "react";
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

const ParticipantsJudge = ({
  selectedTeam,
  selectedPlayer,
  timeTypes = [],
  players = [],
  timeLogs = [],
  alert,
}) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [alertText, setAlertText] = useState("");
  const [currentHeat, setCurrentHeat] = useState(null);

  console.log("ParticipantsJudge - selectedPlayer: ", selectedPlayer);
  const playerName = getPlayerName(selectedPlayer, players);
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

  const prevPlayerId = getPrevPlayerId(selectedTeam, currentHeat, timeLogs);
  const prevPlayerName = getPlayerName(prevPlayerId, players);
  console.log("Current heat: ", currentHeat);
  console.log("Prev player: ", prevPlayerId);

  const handleStartStop = async (playerId) => {
    const timeTypeId = getTimeType(TIME_TYPE_SAIL, timeTypes).id;
    const { data, error } = await supabase.from(TIME_LOGS_TABLE).insert([
      {
        team_id: selectedTeam,
        player_id: playerId,
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
        timeTypes.find((e) => e.id === timeType).time_eng
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
          onClick={() => handleStartStop(selectedPlayer)}
        >
          Start {playerName} {TIME_TYPE_SAIL}
        </Button>
      </Box>
    </>
  );
};

export default ParticipantsJudge;
