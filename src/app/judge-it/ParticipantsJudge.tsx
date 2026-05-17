"use client";

import React, { useMemo } from "react";
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
import { useCurrentHeat, useHeatControls } from "../hooks";

interface ParticipantsJudgeProps {
  selectedTeam: Team | null;
  selectedPlayer: Player | null;
}

const ParticipantsJudge: React.FC<ParticipantsJudgeProps> = ({
  selectedTeam,
  selectedPlayer,
}) => {
  const { alert, heats, players, reload, timeTypes } = useFetchDataConvex();
  const { timeLogs } = useCurrentHeat();
  const currentHeat = getCurrentHeat(heats, alert);

  const playerName = getPlayerName(selectedPlayer?.id || null, players);
  const prevPlayerId = getPrevPlayerId(
    selectedTeam?.id || null,
    currentHeat,
    timeLogs,
  );
  const prevPlayerName = getPlayerName(prevPlayerId, players);

  const { handleStartStop } = useHeatControls({}, alert);

  const sailTypeId = timeTypes.find((tt) => tt.time_eng === TIME_TYPE_SAIL)!.id;
  const teamSailTimeLogs = useMemo(() => {
    return timeLogs.filter(
      (l) => l.team_id === selectedTeam?.id && l.time_type_id === sailTypeId,
    ).length;
  }, [timeLogs]);

  const handleStartStopClick = (isFullStop: boolean) => () => {
    if (isFullStop)
      handleStartStop(prevPlayerId, prevPlayerId, selectedTeam?.id);
    else handleStartStop(prevPlayerId, selectedPlayer?.id, selectedTeam?.id);
    reload();
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
        {teamSailTimeLogs >= 15 && (
          <JudgeButton
            color="error"
            disabled={teamSailTimeLogs > 15}
            onClick={handleStartStopClick(true)}
          >
            STOP {prevPlayerName} {TIME_TYPE_SAIL}
          </JudgeButton>
        )}
        {teamSailTimeLogs < 15 && (
          <JudgeButton
            disabled={teamSailTimeLogs % 4 !== 3}
            onClick={handleStartStopClick(false)}
          >
            Stop {prevPlayerName} and Start {playerName} {TIME_TYPE_SAIL}
          </JudgeButton>
        )}
      </Stack>
    </>
  );
};

export default ParticipantsJudge;
