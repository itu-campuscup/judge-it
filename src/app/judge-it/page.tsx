"use client";

import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { useAuth } from "@/AuthContext";
import TeamSelect from "./TeamSelect";
import PlayerSelect from "./PlayerSelect";
import MainJudge from "./MainJudge";
import Header from "../components/Header";
import ParticipantsJudge from "./ParticipantsJudge";
import BeerJudge from "./BeerJudge";
import NotLoggedIn from "../components/NotLoggedIn";
import AlertComponent from "../components/AlertComponent";
import useFetchData from "../hooks/useFetchData";
import { BEER_JUDGE, MAIN_JUDGE, PARTICIPANTS_JUDGE } from "@/utils/constants";
import type { Player } from "@/types";

function Judge(): React.ReactElement {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeam] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectPlayerString, setSelectPlayerString] =
    useState<string>("Select player");
  const [judgeType, setJudgeType] = useState<string>("");
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const { players, heats, teams, timeTypes, timeLogs, alert } = useFetchData();

  if (!user) {
    return <NotLoggedIn />;
  }

  return (
    <Container maxWidth="md">
      <Header user={user} />
      <Stack
        spacing={2}
        sx={{
          minHeight:
            judgeType === MAIN_JUDGE
              ? "calc(110vh - 80px)"
              : "calc(100vh - 80px)",
          maxHeight:
            judgeType === MAIN_JUDGE
              ? "calc(110vh - 80px)"
              : "calc(100vh - 80px)",
          overflowY: "auto",
          py: 2,
        }}
      >
        <Typography variant="h3" align="center">
          Judge Page
        </Typography>
        <FormControl fullWidth variant="filled">
          <Typography variant="h6" gutterBottom>
            Judge type
          </Typography>
          <RadioGroup row onChange={(e) => setJudgeType(e.target.value)}>
            <FormControlLabel
              value={MAIN_JUDGE}
              control={<Radio />}
              label="Participants main"
            />
            <FormControlLabel
              value={PARTICIPANTS_JUDGE}
              control={<Radio />}
              label="Participants side"
            />
            <FormControlLabel
              value={BEER_JUDGE}
              control={<Radio />}
              label="Beer side"
            />
          </RadioGroup>
        </FormControl>

        <Box>
          {/**
           * Show team selection as a dropdown
           * Will only show active teams
           */}
          <TeamSelect
            selectedTeamId={selectedTeamId}
            setSelectedTeam={setSelectedTeam}
            teams={teams}
            alert={alert}
          />
        </Box>

        <Box>
          {/**
           * Show player selection as a group of radio buttons
           * Disable the radio group if there are no players
           */}
          <PlayerSelect
            teams={teams}
            selectedTeamId={selectedTeamId}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
            players={players}
            teamPlayers={teamPlayers}
            setTeamPlayers={setTeamPlayers}
            selectPlayerString={selectPlayerString}
            setSelectPlayerString={setSelectPlayerString}
            alert={alert}
          />
        </Box>
        {/**
         * Display the specific judge extra functionality
         *
         * Loads main.jsx if judgeType is main
         * Loads participants.jsx if judgeType is participants side
         * Loads beer.jsx if judgeType is beer side
         */}
        {judgeType === MAIN_JUDGE && (
          <MainJudge
            user={user}
            parentTeam={selectedTeamId ? Number(selectedTeamId) : null}
            parentPlayer={selectedPlayer ? Number(selectedPlayer) : null}
            teams={teams}
            players={players}
            heats={heats}
            time_types={timeTypes}
            alert={alert}
          />
        )}
        {judgeType === PARTICIPANTS_JUDGE && (
          <ParticipantsJudge
            selectedTeam={
              teams.find((t) => t.id === Number(selectedTeamId)) || null
            }
            selectedPlayer={
              players.find((p) => p.id === Number(selectedPlayer)) || null
            }
            timeTypes={timeTypes}
            players={players}
            timeLogs={timeLogs}
            alert={alert}
          />
        )}
        {judgeType === BEER_JUDGE && (
          <BeerJudge
            players={players}
            selectedTeam={selectedTeamId ? Number(selectedTeamId) : null}
            selectedPlayer={selectedPlayer ? Number(selectedPlayer) : null}
            timeTypes={timeTypes}
            alert={alert}
          />
        )}
      </Stack>
      <AlertComponent
        severity={alert.severity}
        text={alert.text}
        open={alert.open}
        setOpen={alert.setOpen}
      />
    </Container>
  );
}

export default Judge;
