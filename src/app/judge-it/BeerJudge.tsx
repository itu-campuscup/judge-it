import React from "react";
import AlertComponent from "../components/AlertComponent";
import { Stack } from "@mui/material";
import {
  getPlayerName,
  getPlayerIdGivenTeamAndTimeLogs,
} from "@/utils/getUtils";
import {
  TIME_TYPE_SAIL,
  TIME_TYPE_BEER,
  TIME_TYPE_SPIN,
} from "@/utils/constants";
import type { Team, TimeType } from "@/types";
import useFetchDataConvex from "../hooks/useFetchDataConvex";
import JudgeButton from "../components/JudgeButton";
import { useHeatControls } from "../hooks";
import { Id } from "convex/_generated/dataModel";

interface BeerJudgeProps {
  selectedTeam: Team | null;
}

const BeerJudge: React.FC<BeerJudgeProps> = ({ selectedTeam }) => {
  const { alert, players, timeLogs, timeTypes } = useFetchDataConvex();

  const latestPlayer =
    selectedTeam !== null
      ? getPlayerIdGivenTeamAndTimeLogs(selectedTeam.id, timeLogs)
      : null;
  const playerName = latestPlayer
    ? getPlayerName(latestPlayer, players)
    : "player null";

  const { insertTimeLog } = useHeatControls({}, alert);

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

  const handleTimeTypeClick = (timeTypeId: Id<"time_types">) => {
    insertTimeLog(timeTypeId, latestPlayer, selectedTeam?.id);
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
