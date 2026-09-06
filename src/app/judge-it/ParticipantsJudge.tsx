"use client";

import React, { useMemo, useState } from "react";
import { Stack } from "@mui/material";
import AlertComponent from "../components/AlertComponent";
import {
  getPlayerName,
  getCurrentHeat,
  getPrevPlayerId,
} from "@/utils/getUtils";
import { TIME_TYPE_SAIL } from "@/utils/constants";
import useFetchDataConvex from "../hooks/useFetchDataConvex";
import JudgeButton from "../components/JudgeButton";
import { useCurrentHeat, useHeatControls } from "../hooks";
import { Id } from "convex/_generated/dataModel";
import TeamSelect from "../components/TeamSelect";
import PlayerSelect from "../components/PlayerSelect";

const ParticipantsJudge: React.FC = () => {
  const { alert, heats, players, reload, timeTypes } = useFetchDataConvex();
  const { timeLogs } = useCurrentHeat();
  const currentHeat = getCurrentHeat(heats, alert);

  const [teamId, setTeamId] = useState<Id<"teams"> | null>(null);
  const [playerId, setPlayerId] = useState<Id<"players"> | null>(null);

  const playerName = getPlayerName(playerId, players);
  const prevPlayerId = getPrevPlayerId(teamId, currentHeat, timeLogs);
  const prevPlayerName = getPlayerName(prevPlayerId, players);

  const { handleStartStop } = useHeatControls({}, alert);

  const sailTypeId = timeTypes.find((tt) => tt.time_eng === TIME_TYPE_SAIL)!.id;
  const teamSailTimeLogs = useMemo(() => {
    return timeLogs.filter(
      (l) => l.team_id === teamId && l.time_type_id === sailTypeId,
    ).length;
  }, [timeLogs]);

  const handleStartStopClick = (isFullStop: boolean) => () => {
    if (isFullStop)
      handleStartStop(prevPlayerId, prevPlayerId, teamId || undefined);
    else handleStartStop(prevPlayerId, playerId, teamId || undefined);
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
      <TeamSelect selectedTeamId={teamId} setSelectedTeam={setTeamId} />
      <PlayerSelect
        selectedTeamId={teamId}
        selectedPlayer={playerId}
        setSelectedPlayer={setPlayerId}
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
