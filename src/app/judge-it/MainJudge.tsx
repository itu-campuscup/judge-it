import React, { useState, useEffect } from "react";
import TeamSelect from "./TeamSelect";
import PlayerSelect from "./PlayerSelect";
import { Button, Stack } from "@mui/material";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import AlertComponent from "../components/AlertComponent";
import { getCurrentHeat } from "@/utils/getUtils";
import { convexIdToNumber } from "@/utils/convexHelpers";
import { TIME_TYPE_SAIL } from "@/utils/constants";
import type { Team, Player, TimeType, Heat, AlertObject } from "@/types";
import { Id } from "convex/_generated/dataModel";

interface MainJudgeProps {
  parentTeam: number | null;
  parentPlayer: number | null;
  teams: Team[];
  players: Player[];
  time_types: TimeType[];
  heats: Heat[];
  alert: AlertObject;
}

const MainJudge: React.FC<MainJudgeProps> = ({
  parentTeam,
  parentPlayer,
  teams,
  players,
  time_types,
  heats,
  alert,
}) => {
  const createTimeLog = useMutation(api.mutations.createTimeLog);
  const createHeat = useMutation(api.mutations.createHeat);
  const setCurrentHeat = useMutation(api.mutations.setCurrentHeat);

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
    const currentHeatData = getCurrentHeat(heats, alert);
    return currentHeatData ? currentHeatData.heat + 1 : 1;
  };

  /**
   * Create and set a new heat as current
   */
  const createAndSetNewHeat = async (): Promise<Heat | null> => {
    try {
      // Create new heat and set as current (setCurrentHeat will unset others automatically)
      const newHeatId = await createHeat({
        name: `Heat ${nextHeatNumber}`,
        heat: nextHeatNumber,
        date: new Date().toISOString().split("T")[0],
        is_current: false,
      });

      // Set as current (this automatically unsets other heats)
      await setCurrentHeat({ id: newHeatId as Id<"heats"> });

      // Return the new heat object
      return {
        id: convexIdToNumber(newHeatId as Id<"heats">),
        heat: nextHeatNumber,
        date: new Date().toISOString().split("T")[0],
        is_current: true,
      };
    } catch (error) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Error creating new heat: " + (error as Error).message);
      alert.setContext({
        operation: "create_new_heat",
        location: "MainJudge.createAndSetNewHeat",
        metadata: {
          step: "create_heat",
          nextHeatNumber,
        },
      });
      return null;
    }
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
      alert.setContext({
        operation: "global_start_timer",
        location: "MainJudge.handleGlobalStart",
        metadata: {
          availableTimeTypes: time_types.map((t) => t.time_eng),
          searchingFor: TIME_TYPE_SAIL,
        },
      });
      return;
    }

    try {
      // Get current time
      const now = new Date();
      const timeSeconds =
        now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const timeString = now.toLocaleTimeString("en-GB", { hour12: false });

      // Insert both time logs
      await createTimeLog({
        team_id: parentTeam as unknown as Id<"teams"> | undefined,
        player_id: parentPlayer as unknown as Id<"players">,
        time_type_id: sailTimeType.id as unknown as Id<"time_types">,
        heat_id: newHeat.id as unknown as Id<"heats">,
        time_seconds: timeSeconds,
        time: timeString,
      });

      await createTimeLog({
        team_id: selectedTeamId as unknown as Id<"teams"> | undefined,
        player_id: selectedPlayer as unknown as Id<"players">,
        time_type_id: sailTimeType.id as unknown as Id<"time_types">,
        heat_id: newHeat.id as unknown as Id<"heats">,
        time_seconds: timeSeconds,
        time: timeString,
      });

      // Success - show confirmation
      alert.setOpen(true);
      alert.setSeverity("success");
      alert.setText(`Heat ${newHeat.heat} started! Global timer running.`);
      alert.setContext({
        operation: "global_start_timer",
        location: "MainJudge.handleGlobalStart",
        metadata: {
          heatNumber: newHeat.heat,
          parentTeam,
          selectedTeamId,
        },
      });

      // Update next heat number for the button
      const updatedNextHeat = await getNextHeatNumber();
      setNextHeatNumber(updatedNextHeat);
    } catch (error) {
      const err = "Error starting global timer: " + (error as Error).message;
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText(err);
      alert.setContext({
        operation: "global_start_timer",
        location: "MainJudge.handleGlobalStart",
        metadata: {
          step: "insert_time_logs",
          parentTeam,
          parentPlayer,
          selectedTeamId,
          selectedPlayer,
          heatId: newHeat.id,
        },
      });
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
      alert.setContext({
        operation: "validate_inputs",
        location: "MainJudge.checkInputs",
        metadata: { missingField: "parentTeam" },
      });
      return false;
    } else if (!parentPlayer) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Missing player in the top");
      alert.setContext({
        operation: "validate_inputs",
        location: "MainJudge.checkInputs",
        metadata: { missingField: "parentPlayer", parentTeam },
      });
      return false;
    } else if (!selectedTeamId) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Missing selected team in the bottom");
      alert.setContext({
        operation: "validate_inputs",
        location: "MainJudge.checkInputs",
        metadata: { missingField: "selectedTeamId", parentTeam, parentPlayer },
      });
      return false;
    } else if (!selectedPlayer) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Missing selected player in the bottom");
      alert.setContext({
        operation: "validate_inputs",
        location: "MainJudge.checkInputs",
        metadata: {
          missingField: "selectedPlayer",
          parentTeam,
          parentPlayer,
          selectedTeamId,
        },
      });
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
        context={alert.context}
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
