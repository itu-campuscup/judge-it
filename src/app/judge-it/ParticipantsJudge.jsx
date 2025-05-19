import { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import { Button, Box } from "@mui/material";
import AlertComponent from "../components/AlertComponent";
import styles from "@/app/page.module.css";
import { getPlayerGivenId } from "@/utils/getUtils";
import { HEATS_TABLE, TIME_LOGS_TABLE, TIME_TYPE_SAIL } from "@/utils/constants";

const ParticipantsJudge = ({
  selectedTeam,
  selectedPlayer,
  timeTypes = [],
  players = [],
}) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [alertText, setAlertText] = useState("");

  const playerName = getPlayerGivenId(selectedPlayer, players);

  /**
   * Create buttons for each time type
   * Only for participant side
   *
   * @returns {Array} Array of buttons
   */
  const timeTypeButtons = timeTypes
    .filter((e) => e.is_participant_side)
    .map((timeType) => {
      const text = "Start " + playerName + " " + timeType.time_eng;

      return (
        <Button
          key={timeType.id}
          variant="contained"
          color="primary"
          className={styles.timeTypeButton}
          onClick={() => handleTimeTypeClick(timeType.id)}
        >
          {text}
        </Button>
      );
    });

  /**
   * Get current heat
   */
  const getHeat = async () => {
    const { data, error } = await supabase
      .from(HEATS_TABLE)
      .select("*")
      .eq("is_current", true);
    if (error) {
      const err = "Error fetching current heat: " + error.message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      console.error(err);
    }
    return data[0];
  };

  /**
   * Handle button click to start/stop the timers to send a row to the db
   */
  const handleTimeTypeClick = async (timeTypeId) => {
    if (timeTypeId === -1) {
      timeTypeId = timeTypes.find((e) => e.time_eng === TIME_TYPE_SAIL).id;
    }
    const { data, error } = await supabase
      .from(TIME_LOGS_TABLE)
      .insert([
        {
          team_id: selectedTeam,
          player_id: selectedPlayer,
          time_type_id: timeTypeId,
          heat_id: (await getHeat()).id,
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
        timeTypes.find((e) => e.id === timeTypeId).time_eng
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
          onClick={() => handleTimeTypeClick(-1)}
        >
          STOP
        </Button>
        {timeTypeButtons}
      </Box>
    </>
  );
};

export default ParticipantsJudge;
