"use client";

import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { useAuth } from "../../AuthContext";
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

function Judge() {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectPlayerString, setSelectPlayerString] = useState("Select player");
  const [judgeType, setJudgeType] = useState("");
  const [teamPlayers, setTeamPlayers] = useState([]);

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
              value="main"
              control={<Radio />}
              label="Participants main"
            />
            <FormControlLabel
              value="participants"
              control={<Radio />}
              label="Participants side"
            />
            <FormControlLabel
              value="beer"
              control={<Radio />}
              label="Beer side"
            />
          </RadioGroup>
        </FormControl>
        {/**
         * Show team selection as a dropdown
         * Will only show active teams
         */}
        <TeamSelect
          user={user}
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
         */}
        {judgeType === "main" && (
          <MainJudge
            user={user}
            parentTeam={selectedTeamId}
            parentPlayer={selectedPlayer}
            teams={teams}
            players={players}
            time_types={timeTypes}
            alert={alert}
          />
        )}
        {judgeType === "participants" && (
          <ParticipantsJudge
            selectedTeam={selectedTeamId}
            selectedPlayer={selectedPlayer}
            timeTypes={timeTypes}
          />
        )}
        {judgeType === "beer" && (
          <BeerJudge
            players={players}
            selectedTeam={selectedTeamId}
            selectedPlayer={selectedPlayer}
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
