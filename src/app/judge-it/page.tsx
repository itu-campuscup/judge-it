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
} from "@mui/material";
import { useAuth } from "@/AuthContext";
import styles from "../page.module.css";
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
    <Container>
      <Header user={user} />
      <Box className={styles.main}>
        <Typography variant="h3">Judge Page</Typography>
        <FormControl fullWidth margin="normal" variant="filled">
          <Typography>Judge type</Typography>
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
        {/**
         * Show team selection as a dropdown
         * Will only show active teams
         */}{" "}
        <TeamSelect
          selectedTeamId={selectedTeamId}
          setSelectedTeam={setSelectedTeam}
          teams={teams}
          alert={alert}
        />
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
        {/**
         * Display the specific judge extra functionality
         *
         * Loads main.jsx if judgeType is main
         * Loads participants.jsx if judgeType is participants side
         * Loads beer.jsx if judgeType is beer side
         */}{" "}
        {judgeType === MAIN_JUDGE && (
          <MainJudge
            user={user}
            parentTeam={selectedTeamId ? Number(selectedTeamId) : null}
            parentPlayer={selectedPlayer ? Number(selectedPlayer) : null}
            teams={teams}
            players={players}
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
      </Box>
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
