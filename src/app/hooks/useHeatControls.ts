import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { getCurrentHeat } from "@/utils/getUtils";
import { TIME_TYPE_SAIL } from "@/utils/constants";
import type { AlertObject, Heat } from "@/types";
import useFetchDataConvex from "../hooks/useFetchDataConvex";

interface MainJudgeProps {
  teamA?: Id<"teams"> | null;
  teamB?: Id<"teams"> | null;
  playerA?: Id<"players"> | null;
  playerB?: Id<"players"> | null;
}

const useHeatControls = (
  { teamA, playerA, teamB, playerB }: MainJudgeProps,
  alert: AlertObject,
) => {
  const { heats, timeTypes } = useFetchDataConvex();
  const createHeat = useMutation(api.mutations.createHeat);
  const setCurrentHeat = useMutation(api.mutations.setCurrentHeat);
  const createTimeLogsBatch = useMutation(api.mutations.createTimeLogsBatch);
  const [nextHeatNumber, setNextHeatNumber] = useState<number>(1);

  // Calculate next heat number when component mounts
  useEffect(() => {
    const calculateNextHeat = async () => {
      const nextHeat = await getNextHeatNumber();
      setNextHeatNumber(nextHeat);
    };
    calculateNextHeat();
  }, [heats]);

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
    if (!validateInputs("handleGlobalStart", teamA, teamB, playerA, playerB))
      return;

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
            team_id: (teamA ?? undefined) as Id<"teams"> | undefined,
            player_id: playerA as Id<"players">,
            time_type_id: sailTimeType.id,
            heat_id: newHeat.id,
          },
          {
            team_id: (teamB || undefined) as Id<"teams"> | undefined,
            player_id: playerB as Id<"players">,
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
          teamA,
          teamB,
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
          teamA,
          playerA,
          teamB,
          playerB,
          heatId: newHeat.id,
        },
      });
    }
  };

  /**
   * Check all inputs are present
   * Otherwise create alert
   */
  const validateInputs = (caller: string, ...lst: any[]): boolean => {
    for (const elem of lst) {
      if (!elem) {
        alert.setOpen(true);
        alert.setSeverity("error");
        alert.setText("Inputs not validated.");
        alert.setContext({
          operation: "validate_inputs",
          location: `useHeatControls.${caller}`,
          metadata: {
            parameters: lst,
          },
        });
        return false;
      }
    }
    return true;
  };

  return { nextHeatNumber, handleGlobalStart };
};

export default useHeatControls;
