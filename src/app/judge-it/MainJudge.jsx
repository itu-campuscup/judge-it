import { useState, useEffect } from "react";
import TeamSelect from "./TeamSelect";
import PlayerSelect from "./PlayerSelect";
import { Button } from "@mui/material";
import { supabase } from "@/SupabaseClient";
import AlertComponent from "../components/AlertComponent";
import SetHeat from "./SetHeat";
import { getCurrentHeat } from "@/utils/getUtils";
import { TIME_TYPE_SAIL, TIME_LOGS_TABLE } from "@/utils/constants";

const MainJudge = ({
  user,
  parentTeam,
  parentPlayer,
  teams,
  players,
  time_types,
  alert,
}) => {
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectPlayerString, setSelectPlayerString] = useState("Select Player");

  const currentHeat = getCurrentHeat(alert);

  /**
   * Handle global start timer
   * @returns {Promise<void>}
   * @throws {Error} If there is an error starting the timer
   */
  const handleGlobalStart = async () => {
    if (!checkInputs()) return;
    const time_type_id = time_types.find(
      (e) => e.time_eng === TIME_TYPE_SAIL
    ).id;
    const heatId = currentHeat.id;
    const { data, error } = await supabase.from(TIME_LOGS_TABLE).insert([
      {
        team_id: parentTeam,
        player_id: parentPlayer,
        time_type_id: time_type_id,
        heat_id: heatId,
      },
      {
        team_id: selectedTeamId,
        player_id: selectedPlayer,
        time_type_id: time_type_id,
        heat_id: heatId,
      },
    ]);
    if (error) {
      const err = "Error starting global timer: " + error.message;
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText(err);
      console.error(err);
    } else {
      alert.setOpen(true);
      alert.setSeverity("success");
      alert.setText("Global timer started");
    }
  };

  /**
   * Check all inputs are present
   * Otherwise create alert
   */
  const checkInputs = () => {
    if (!parentTeam) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Missing team in the top");
      return false;
    } else if (!parentPlayer) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Missing player in the top");
      return false;
    } else if (!selectedTeamId) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Missing selected team in the bottom");
      return false;
    } else if (!selectedPlayer) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Missing selected player in the bottom");
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
      <SetHeat user={user} />
      {/**
       * Show team selection as a dropdown
       * Will only show active teams
       */}
      <TeamSelect
        user={user}
        selectedTeamId={selectedTeamId}
        setSelectedTeam={setSelectedTeamId}
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
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleGlobalStart()}
      >
        Global start
      </Button>
    </>
  );
};

export default MainJudge;
