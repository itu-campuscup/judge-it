"use client";

import React from "react";
import { Stack } from "@mui/material";
import AlertComponent from "../components/AlertComponent";
import {
  getPlayerName,
  getCurrentHeat,
  getPrevPlayerId,
} from "@/utils/getUtils";
import { TIME_TYPE_SAIL } from "@/utils/constants";
import type { Team, Player } from "@/types";
import useFetchDataConvex from "../hooks/useFetchDataConvex";
import JudgeButton from "../components/JudgeButton";
import { useHeatControls } from "../hooks";

interface ParticipantsJudgeProps {
  selectedTeam: Team | null;
  selectedPlayer: Player | null;
}

const ParticipantsJudge: React.FC<ParticipantsJudgeProps> = ({
  selectedTeam,
  selectedPlayer,
}) => {
  const { alert, heats, players, timeLogs } = useFetchDataConvex();
  const currentHeat = getCurrentHeat(heats, alert);

  const playerName = getPlayerName(selectedPlayer?.id || null, players);
  const prevPlayerId = getPrevPlayerId(
    selectedTeam?.id || null,
    currentHeat,
    timeLogs,
  );
  const prevPlayerName = getPlayerName(prevPlayerId, players);

  const { handleStartStop } = useHeatControls({}, alert);

  const handleStartStopClick = (isFullStop: boolean) => () => {
    if (isFullStop)
      handleStartStop(prevPlayerId, prevPlayerId, selectedTeam?.id);
    else handleStartStop(prevPlayerId, selectedPlayer?.id, selectedTeam?.id);
  };

  return (
    <>
      <AlertComponent
        open={alert.open}
        severity={alert.severity}
        text={alert.text}
        context={alert.context}
        setOpen={alert.setOpen}
      />
      <Stack spacing={2} sx={{ width: "100%" }}>
        {prevPlayerId !== null && (
          <JudgeButton color="error" onClick={handleStartStopClick(true)}>
            STOP {prevPlayerName} {TIME_TYPE_SAIL}
          </JudgeButton>
        )}
        <JudgeButton onClick={handleStartStopClick(false)}>
          Stop prev and Start {playerName} {TIME_TYPE_SAIL}
        </JudgeButton>
      </Stack>
    </>
  );
};

export default ParticipantsJudge;
