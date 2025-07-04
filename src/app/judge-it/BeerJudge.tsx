import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/SupabaseClient";
import AlertComponent from "../components/AlertComponent";
import { Button, Box } from "@mui/material";
import styles from "@/app/page.module.css";
import { getPlayerName, getCurrentHeat } from "@/utils/getUtils";
import {
  TIME_LOGS_TABLE,
  TIME_TYPE_SAIL,
  TIME_TYPE_BEER,
  TIME_TYPE_SPIN,
} from "@/utils/constants";
import type { Player, TimeType } from "@/types";

interface BeerJudgeProps {
  players: Player[];
  selectedTeam: number | null;
  selectedPlayer: number | null;
  timeTypes: TimeType[];
  alert: any;
}

const BeerJudge: React.FC<BeerJudgeProps> = ({
  players,
  selectedTeam,
  selectedPlayer,
  timeTypes = [],
  alert,
}) => {
  const [isTiming, setIsTiming] = useState<boolean>(false);
  const [participantApproaching, setParticipantApproaching] =
    useState<boolean>(false);

  const playerName = getPlayerName(selectedPlayer || 0, players);
  /**
   * Create buttons for each time type
   *
   * @returns {Array} Array of buttons
   */
  const timeTypeButtons = useCallback(
    () =>
      timeTypes.map((timeType: TimeType) => {
        const sailingText = `${
          participantApproaching ? "Stop " : "Start "
        }${playerName} ${timeType.time_eng}`;
        const beerText = `${
          participantApproaching ? "Start " : "Stop "
        }${playerName} ${timeType.time_eng}`;
        const spinText = `${
          participantApproaching ? "Start " : "Stop "
        }${playerName} ${timeType.time_eng}`;

        const text = (name: string): string => {
          if (name === TIME_TYPE_SAIL) return sailingText;
          if (name === TIME_TYPE_BEER) return beerText;
          if (name === TIME_TYPE_SPIN) return spinText;
          alert.setOpen(true);
          alert.setSeverity("error");
          alert.setText("Unknown time type");
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
      }),
    [timeTypes, playerName, participantApproaching]
  );
  /**
   * Handle button click to start/stop the timers to send a row to the db
   */
  const handleTimeTypeClick = async (timeTypeId: number): Promise<void> => {
    const currentHeat = await getCurrentHeat(alert);
    if (!currentHeat) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("No current heat found");
      return;
    }

    const isValid = validateInputs();
    if (!isValid) return;

    const { data, error } = await supabase.from(TIME_LOGS_TABLE).insert([
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
        (timeTypes.find((e) => e.id === timeTypeId)?.time_eng || "Unknown")
    );
  };
  /**
   * Validate inputs before sending to the database
   * @returns {boolean} True if inputs are valid, false otherwise
   */
  const validateInputs = (): boolean => {
    let errorTxt: string | null = null;

    if (!selectedTeam) {
      errorTxt = "Team has not been selected";
    } else if (!selectedPlayer) {
      errorTxt = "Player has not been selected";
    } else if (!timeTypes.length) {
      errorTxt = "No time types available";
    }

    if (errorTxt) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText(errorTxt);
      console.error(errorTxt);
      return false;
    }

    return true;
  };

  return (
    <>
      <AlertComponent
        severity={alert.severity}
        text={alert.text}
        open={alert.open}
        setOpen={alert.setOpen}
      />
      <Box className={styles.timeTypeButtonContainer}>{timeTypeButtons()}</Box>
    </>
  );
};

export default BeerJudge;
