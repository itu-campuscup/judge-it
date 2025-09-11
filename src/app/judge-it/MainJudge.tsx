import React, { useState, useEffect } from "react";
import TeamSelect from "./TeamSelect";
import PlayerSelect from "./PlayerSelect";
import { Button, Stack } from "@mui/material";
import { supabase } from "@/SupabaseClient";
import AlertComponent from "../components/AlertComponent";
import { getCurrentHeat } from "@/utils/getUtils";
import {
  TIME_TYPE_SAIL,
  TIME_LOGS_TABLE,
  HEATS_TABLE,
} from "@/utils/constants";
import type { Team, Player, TimeType, Heat } from "@/types";

interface MainJudgeProps {
  user: any;
  parentTeam: number | null;
  parentPlayer: number | null;
  teams: Team[];
  players: Player[];
  time_types: TimeType[];
  heats: Heat[]; // Add heats prop
  alert: any;
}

const MainJudge: React.FC<MainJudgeProps> = ({
  user,
  parentTeam,
  parentPlayer,
  teams,
  players,
  time_types,
  heats, // Add heats prop
  alert,
}) => {
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectPlayerString, setSelectPlayerString] =
    useState<string>("Select Player");
  const [nextHeatNumber, setNextHeatNumber] = useState<number>(1);

  // Calculate next heat number when component mounts
  useEffect(() => {
    const calculateNextHeat = async () => {
      const nextHeat = await getNextHeatNumber();
      setNextHeatNumber(nextHeat);
    };
    calculateNextHeat();
  }, []);

  /**
   * Get the next heat number based on current heat
   */
  const getNextHeatNumber = async (): Promise<number> => {
    const currentHeatData = await getCurrentHeat(alert);
    return currentHeatData ? currentHeatData.heat + 1 : 1;
  };

  /**
   * Create and set a new heat as current
   */
  const createAndSetNewHeat = async (): Promise<Heat | null> => {
    // Set all existing heats to not current
    const { error: updateError } = await supabase
      .from(HEATS_TABLE)
      .update({ is_current: false })
      .eq("is_current", true);

    if (updateError) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Error updating current heat: " + updateError.message);
      return null;
    }

    // Create new heat
    const { data: newHeat, error: createError } = await supabase
      .from(HEATS_TABLE)
      .insert([{ heat: nextHeatNumber, is_current: true }])
      .select()
      .single();

    if (createError) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Error creating new heat: " + createError.message);
      return null;
    }

    return newHeat;
  };

  /**
   * Handle global start timer with automatic heat increment
   * @returns {Promise<void>}
   * @throws {Error} If there is an error starting the timer
   */
  const handleGlobalStart = async (): Promise<void> => {
    if (!checkInputs()) return;

    // Automatically create and set new heat
    const newHeat = await createAndSetNewHeat();
    if (!newHeat) {
      return; // Error already shown in createAndSetNewHeat
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
        heat_id: newHeat.id,
      },
      {
        team_id: parseInt(selectedTeamId),
        player_id: parseInt(selectedPlayer),
        time_type_id: sailTimeType.id,
        heat_id: newHeat.id,
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
      alert.setText(`Heat ${newHeat.heat} started! Global timer running.`);

      // Update next heat number for the button
      const updatedNextHeat = await getNextHeatNumber();
      setNextHeatNumber(updatedNextHeat);
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

  return (
    <>
      <AlertComponent
        severity={alert.severity}
        text={alert.text}
        open={alert.open}
        setOpen={alert.setOpen}
      />
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
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{
            minHeight: 80,
            fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
            padding: 2,
          }}
          onClick={() => handleGlobalStart()}
        >
          Start Heat {nextHeatNumber} & Global Timer
        </Button>
      </Stack>
    </>
  );
};

export default MainJudge;
