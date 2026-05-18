import React, { useState } from "react";
import { Stack } from "@mui/material";
import { Id } from "convex/_generated/dataModel";
import { useFetchDataConvex, useHeatControls } from "../hooks";
import TeamSelect from "../components/TeamSelect";
import PlayerSelect from "../components/PlayerSelect";
import AlertComponent from "../components/AlertComponent";
import JudgeButton from "../components/JudgeButton";

const MainJudge: React.FC = () => {
  const { alert } = useFetchDataConvex();

  const [teamA, setTeamA] = useState<Id<"teams"> | null>(null);
  const [teamB, setTeamB] = useState<Id<"teams"> | null>(null);
  const [playerA, setPlayerA] = useState<Id<"players"> | null>(null);
  const [playerB, setPlayerB] = useState<Id<"players"> | null>(null);

  const { handleGlobalStart, nextHeatNumber } = useHeatControls(
    { teamA, teamB, playerA, playerB },
    alert,
  );

  return (
    <>
      <AlertComponent
        severity={alert.severity}
        text={alert.text}
        open={alert.open}
        setOpen={alert.setOpen}
        context={alert.context}
      />
      <TeamSelect selectedTeamId={teamA} setSelectedTeam={setTeamA} />
      <PlayerSelect
        selectedTeamId={teamA}
        selectedPlayer={playerA}
        setSelectedPlayer={setPlayerA}
      />
      <TeamSelect selectedTeamId={teamB} setSelectedTeam={setTeamB} />
      <PlayerSelect
        selectedTeamId={teamB}
        selectedPlayer={playerB}
        setSelectedPlayer={setPlayerB}
      />
      <Stack spacing={2} sx={{ width: "100%" }}>
        <JudgeButton onClick={() => handleGlobalStart()}>
          Start Heat {nextHeatNumber} & Global Timer
        </JudgeButton>
      </Stack>
    </>
  );
};

export default MainJudge;
