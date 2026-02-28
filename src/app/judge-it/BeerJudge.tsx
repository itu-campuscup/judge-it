import React from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import AlertComponent from "../components/AlertComponent";
import { Stack } from "@mui/material";
import {
  getPlayerName,
  getCurrentHeat,
  getPlayerIdGivenTeamAndTimeLogs,
} from "@/utils/getUtils";
import {
  TIME_TYPE_SAIL,
  TIME_TYPE_BEER,
  TIME_TYPE_SPIN,
} from "@/utils/constants";
import type { Team, TimeType } from "@/types";
import { Id } from "convex/_generated/dataModel";
import useFetchDataConvex from "../hooks/useFetchDataConvex";
import JudgeButton from "../components/JudgeButton";

interface BeerJudgeProps {
  selectedTeam: Team | null;
}

const BeerJudge: React.FC<BeerJudgeProps> = ({ selectedTeam }) => {
  const { alert, heats, players, timeLogs, timeTypes } = useFetchDataConvex();
  const createTimeLog = useMutation(api.mutations.createTimeLog);

  const latestPlayer =
    selectedTeam !== null
      ? getPlayerIdGivenTeamAndTimeLogs(selectedTeam.id, timeLogs)
      : null;
  const playerName = latestPlayer
    ? getPlayerName(latestPlayer, players)
    : "player null";

  const timeTypeEmoji = (timeType: TimeType) => {
    switch (timeType.time_eng) {
      case TIME_TYPE_SAIL:
        return "⛵";
      case TIME_TYPE_BEER:
        return "🍺";
      case TIME_TYPE_SPIN:
        return "🌪️";
      default:
        return "";
    }
  };

  /**
   * Handle button click to start/stop the timers to send a row to the db
   */
  const handleTimeTypeClick = async (
    timeTypeId: Id<"time_types">,
  ): Promise<void> => {
    const currentHeat = getCurrentHeat(heats, alert);
    if (!currentHeat) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("No current heat found");
      alert.setContext({
        operation: "record_time",
        location: "BeerJudge.handleTimeTypeClick",
        metadata: {
          timeTypeId,
          selectedTeam,
          latestPlayer,
        },
      });
      return;
    }

    const isValid = validateInputs();
    if (!isValid) return;

    try {
      await createTimeLog({
        team_id: (selectedTeam ?? undefined) as Id<"teams"> | undefined,
        player_id: latestPlayer as Id<"players">,
        time_type_id: timeTypeId,
        heat_id: currentHeat.id,
      });
    } catch (error) {
      const err = "Error inserting time log: " + (error as Error).message;
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText(err);
      alert.setContext({
        operation: "record_time",
        location: "BeerJudge.handleTimeTypeClick",
        metadata: {
          step: "insert_time_log",
          teamId: selectedTeam,
          playerId: latestPlayer,
          timeTypeId,
          heatId: currentHeat.id,
        },
      });
      return;
    }
    const timeTypeName =
      timeTypes.find((e) => e.id === timeTypeId)?.time_eng || "Unknown";
    alert.setOpen(true);
    alert.setSeverity("success");
    alert.setText(`Inserted log of type: ${timeTypeName}`);
    alert.setContext({
      operation: "record_time",
      location: "BeerJudge.handleTimeTypeClick",
      metadata: {
        teamId: selectedTeam,
        playerId: latestPlayer,
        timeTypeId,
        timeTypeName,
        heatId: currentHeat.id,
      },
    });
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
      alert.setContext({
        operation: "validate_inputs",
        location: "BeerJudge.validateInputs",
        metadata: {
          selectedTeam,
          latestPlayer,
          timeTypesCount: timeTypes.length,
        },
      });
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
        {timeTypes.map((timeType, idx) => (
          <JudgeButton
            key={idx}
            onClick={() => handleTimeTypeClick(timeType.id)}
          >
            Start/Stop {playerName} {timeType.time_eng}{" "}
            {timeTypeEmoji(timeType)}
          </JudgeButton>
        ))}
      </Stack>
    </>
  );
};

export default BeerJudge;
