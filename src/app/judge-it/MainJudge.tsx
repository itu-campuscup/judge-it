import React, { useState, useEffect } from "react";
import TeamSelect from "./TeamSelect";
import PlayerSelect from "./PlayerSelect";
import { Button, Stack } from "@mui/material";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import AlertComponent from "../components/AlertComponent";
import { getCurrentHeat } from "@/utils/getUtils";
import { TIME_TYPE_SAIL } from "@/utils/constants";
import type { Heat } from "@/types";
import { Id } from "convex/_generated/dataModel";
import useFetchDataConvex from "../hooks/useFetchDataConvex";

interface MainJudgeProps {
  parentTeam: string | null;
  parentPlayer: string | null;
}

const MainJudge: React.FC<MainJudgeProps> = ({ parentTeam, parentPlayer }) => {
  const { alert, heats, timeTypes } = useFetchDataConvex();
  const createHeat = useMutation(api.mutations.createHeat);
  const setCurrentHeat = useMutation(api.mutations.setCurrentHeat);
  const createTimeLogsBatch = useMutation(api.mutations.createTimeLogsBatch);

  const [selectedTeamId, setSelectedTeamId] = useState<Id<"teams"> | null>(
    null,
  );
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

      // Return the new heat object (use Convex _id)
      return {
        id: newHeatId as Id<"heats">,
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

    const sailTimeType = timeTypes.find((e) => e.time_eng === TIME_TYPE_SAIL);
    if (!sailTimeType) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Sailing time type not found");
      alert.setContext({
        operation: "global_start_timer",
        location: "MainJudge.handleGlobalStart",
        metadata: {
          availableTimeTypes: timeTypes.map((t) => t.time_eng),
          searchingFor: TIME_TYPE_SAIL,
        },
      });
      return;
    }

    try {
      await createTimeLogsBatch({
        logs: [
          {
            team_id: (parentTeam ?? undefined) as Id<"teams"> | undefined,
            player_id: parentPlayer as Id<"players">,
            time_type_id: sailTimeType.id,
            heat_id: newHeat.id,
          },
          {
            team_id: (selectedTeamId || undefined) as Id<"teams"> | undefined,
            player_id: selectedPlayer as Id<"players">,
            time_type_id: sailTimeType.id,
            heat_id: newHeat.id,
          },
        ],
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
