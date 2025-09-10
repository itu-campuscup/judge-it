import React, { useCallback } from "react";
import { supabase } from "@/SupabaseClient";
import AlertComponent from "../components/AlertComponent";
import { Button, Stack } from "@mui/material";
import {
  getPlayerName,
  getCurrentHeat,
  getPlayer,
  getPlayerIdGivenTeamAndTimeLogs,
} from "@/utils/getUtils";
import {
  TIME_LOGS_TABLE,
  TIME_TYPE_SAIL,
  TIME_TYPE_BEER,
  TIME_TYPE_SPIN,
} from "@/utils/constants";
import type { Player, TimeLog, TimeType } from "@/types";

interface BeerJudgeProps {
  players: Player[];
  selectedTeam: number | null;
  timeTypes: TimeType[];
  timeLogs: TimeLog[];
  alert: any;
}

const BeerJudge: React.FC<BeerJudgeProps> = ({
  players,
  selectedTeam,
  timeTypes = [],
  timeLogs = [],
  alert,
}) => {
  const latestPlayer =
    selectedTeam !== null
      ? getPlayerIdGivenTeamAndTimeLogs(selectedTeam, timeLogs)
      : null;
  const playerName =
    latestPlayer !== null
      ? getPlayerName(latestPlayer, players)
      : "player null";
  /**
   * Create buttons for each time type
   *
   * @returns {Array} Array of buttons
   */
  const timeTypeButtons = useCallback(
    () =>
      timeTypes.map((timeType: TimeType) => {
        const sailingText = `${"Start/Stop "}${playerName} ${
          timeType.time_eng
        }`;
        const beerText = `${"Start/Stop "}${playerName} ${timeType.time_eng}`;
        const spinText = `${"Start/Stop "}${playerName} ${timeType.time_eng}`;

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
            size="large"
            fullWidth
            sx={{
              minHeight: 80,
              fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
              padding: 2,
            }}
            onClick={() => handleTimeTypeClick(timeType.id)}
          >
            {text(timeType.time_eng)}
          </Button>
        );
      }),
    [timeTypes, playerName]
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
        player_id: latestPlayer,
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
    } else if (!latestPlayer) {
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
      <Stack spacing={2} sx={{ width: "100%" }}>
        {timeTypeButtons()}
      </Stack>
    </>
  );
};

export default BeerJudge;
