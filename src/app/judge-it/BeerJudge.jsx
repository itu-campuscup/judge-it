import { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import AlertComponent from "../components/AlertComponent";
import { Button, Box } from "@mui/material";
import styles from "@/app/page.module.css";
import { getPlayerNameGivenId, getCurrentHeatGivenCtx } from "@/utils/getUtils";

const BeerJudge = ({
  players,
  selectedTeam,
  selectedPlayer,
  timeTypes = [],
  alert,
}) => {
  // const [alertOpen, setAlertOpen] = useState(false);
  // const [alertSeverity, setAlertSeverity] = useState('error');
  // const [alertText, setAlertText] = useState('');
  const [isTiming, setIsTiming] = useState(false);
  const [participantApproaching, setParticipantApproaching] = useState(false);

  const playerName = getPlayerNameGivenId(selectedPlayer, players);

  /**
   * Create buttons for each time type
   *
   * @returns {Array} Array of buttons
   */
  const timeTypeButtons = timeTypes.map(
    (timeType) => {
      const sailingText = `${
        participantApproaching ? "Stop " : "Start "
      }${playerName} ${timeType.time_eng}`;
      const beerText = `${
        participantApproaching ? "Start " : "Stop "
      }${playerName} ${timeType.time_eng}`;
      const spinText = `${
        participantApproaching ? "Start " : "Stop "
      }${playerName} ${timeType.time_eng}`;

      const text = (name) => {
        if (name === "Sail") return sailingText;
        if (name === "Beer") return beerText;
        if (name === "Spin") return spinText;
        setAlertOpen(true);
        setAlertSeverity("error");
        setAlertText("Unknown time type");
        console.error("Unknown time type");
        return "";
      };

      return (
        <Button
          key={timeType.id}
          variant="contained"
          color="primary"
          className={styles.timeTypeButton}
          onClick={() => handleTimeTypeClick(timeType.id)}
        >
          {text(timeType.time_eng)}
        </Button>
      );
    },
    [timeTypes, playerName, participantApproaching]
  );

  /**
   * Handle button click to start/stop the timers to send a row to the db
   */
  const handleTimeTypeClick = async (timeTypeId) => {
    const currentHeat = await getCurrentHeatGivenCtx(supabase, alert);

    var isValid = validateInputs();
    if (!isValid) return;

    const { data, error } = await supabase.from("time_logs").insert([
      {
        team_id: selectedTeam,
        player_id: selectedPlayer,
        time_type_id: timeTypeId,
        heat_id: currentHeat.id,
      },
    ]);
    if (error) {
      const err = "Error inserting time log: " + error.message;
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText(err);
      console.error(err);
      return;
    }
    alert.setOpen(true);
    alert.setSeverity("success");
    alert.setText(
      "Inserted log of type: " +
        timeTypes.find((e) => e.id === timeTypeId).time_eng
    );
    setAlertText(
      "Inserted log of type: " +
        timeTypes.find((e) => e.id === timeTypeId).time_eng
    );
  };

  /**
   * Validate inputs before sending to the database
   * * @returns {boolean} True if inputs are valid, false otherwise
   */
  const validateInputs = () => {
    var errorTxt;

    if (!selectedTeam) {
      errorTxt = "Team has not been selected";
    } else if (!selectedPlayer) {
      errorTxt = "Player has not been selected";
    } else if (!timeTypes.length) {
      errorTxt = "No time types available";
    }

    return errorTxt
      ? (alert.setOpen(true),
        alert.setSeverity("error"),
        alert.setText(errorTxt),
        console.error(errorTxt),
        false)
      : true;
  };

  return (
    <>
      <AlertComponent
        severity={alert.severity}
        text={alert.text}
        open={alert.open}
        setOpen={alert.setOpen}
      />
      <Box className={styles.timeTypeButtonContainer}>{timeTypeButtons}</Box>
    </>
  );
};

export default BeerJudge;
