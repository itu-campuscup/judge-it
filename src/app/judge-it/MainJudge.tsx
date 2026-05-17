import React, { useState } from "react";
import { Stack } from "@mui/material";
import { Id } from "convex/_generated/dataModel";
import { useFetchDataConvex, useHeatControls } from "../hooks";
import TeamSelect from "./TeamSelect";
import PlayerSelect from "./PlayerSelect";
import AlertComponent from "../components/AlertComponent";
import JudgeButton from "../components/JudgeButton";

interface MainJudgeProps {
  parentTeam: string | null;
  parentPlayer: string | null;
}

const MainJudge: React.FC<MainJudgeProps> = ({ parentTeam, parentPlayer }) => {
  const { alert } = useFetchDataConvex();

  const [selectedTeamId, setSelectedTeamId] = useState<Id<"teams"> | null>(
    null,
  );
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectPlayerString, setSelectPlayerString] =
    useState<string>("Select Player");

  const { handleGlobalStart, nextHeatNumber } = useHeatControls(
    {
      teamA: parentTeam as Id<"teams">,
      teamB: selectedTeamId as Id<"teams">,
      playerA: parentPlayer as Id<"players">,
      playerB: selectedPlayer as Id<"players">,
    },
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
      {/**
       * Show team selection as a dropdown
       * Will only show active teams
       */}{" "}
      <TeamSelect
        selectedTeamId={selectedTeamId}
        setSelectedTeam={setSelectedTeamId}
      />
      {/**
       * Show player selection as a group of radio buttons
       * Disable the radio group if there are no players
       */}
      <PlayerSelect
        selectedTeamId={selectedTeamId}
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={setSelectedPlayer}
        selectPlayerString={selectPlayerString}
        setSelectPlayerString={setSelectPlayerString}
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
