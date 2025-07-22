import React, { useState, useEffect } from "react";
import TeamSelect from "./TeamSelect";
import PlayerSelect from "./PlayerSelect";
import { Button } from "@mui/material";
import { supabase } from "@/SupabaseClient";
import AlertComponent from "../components/AlertComponent";
import SetHeat from "./SetHeat";
import { getCurrentHeat } from "@/utils/getUtils";
import { TIME_TYPE_SAIL, TIME_LOGS_TABLE, PARTICIPANTS_STATUS_TABLE } from "@/utils/constants";
import type { Team, Player, TimeType } from "@/types";

interface MainJudgeProps {
  user: any;
  parentTeam: number | null;
  parentPlayer: number | null;
  teams: Team[];
  players: Player[];
  time_types: TimeType[];
  alert: any;
}

const MainJudge: React.FC<MainJudgeProps> = ({
  user,
  parentTeam,
  parentPlayer,
  teams,
  players,
  time_types,
  alert,
}) => {
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectPlayerString, setSelectPlayerString] =
    useState<string>("Select Player");

  const currentHeat = getCurrentHeat(alert);

  /**
   * Handle global start timer
   * @returns {Promise<void>}
   * @throws {Error} If there is an error starting the timer
   */ const handleGlobalStart = async (): Promise<void> => {
    if (!checkInputs()) return;

    const currentHeatData = await getCurrentHeat(alert);
    if (!currentHeatData) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("No current heat found");
      return;
    }

    const sailTimeType = time_types.find((e) => e.time_eng === TIME_TYPE_SAIL);
    if (!sailTimeType) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Sailing time type not found");
      return;
    }

    const { data, error } = await supabase.from(TIME_LOGS_TABLE).insert([
      {
        team_id: parentTeam,
        player_id: parentPlayer,
        time_type_id: sailTimeType.id,
        heat_id: currentHeatData.id,
      },
      {
        team_id: parseInt(selectedTeamId),
        player_id: parseInt(selectedPlayer),
        time_type_id: sailTimeType.id,
        heat_id: currentHeatData.id,
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
  const checkInputs = (): boolean => {
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

  function setParticipantStatus() {

    const updateParticipantsStatus = async (): Promise<void> => {
      try {
        const teamIdParsed = parseInt(selectedTeamId);

        const { error } = await supabase
          .from(PARTICIPANTS_STATUS_TABLE)
          .update({ status: 'upcoming' })
          .eq("id", selectedTeamId)



        if (error) throw new Error("Update 1 failed: " + error.message);

        const { error: error2 } = await supabase
          .from(PARTICIPANTS_STATUS_TABLE)
          .update({ status: 'upcoming' })
          .eq("id", parentTeam);

        if (error2) throw new Error("Update 2 failed: " + error2.message);

        console.log("Status updates completed.");
      } catch (err) {
        console.error("💥 updateParticipantsStatus threw an error:", err);
      }
    };


    updateParticipantsStatus()
      
  }

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
       */}{" "}
      <TeamSelect
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
        onClick={() => {
          setParticipantStatus()        
          //handleGlobalStart()
        }}
      >
        Global start
      </Button>
    </>
  );
};

export default MainJudge;
