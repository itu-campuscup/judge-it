import { useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { getCurrentHeat, getTimeType } from "@/utils/getUtils";
import { TIME_TYPE_SAIL } from "@/utils/constants";
import type { AlertObject } from "@/types";
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
  const startHeat = useMutation(api.mutations.startHeat);
  const createTimeLogsBatch = useMutation(api.mutations.createTimeLogsBatch);
  const createTimeLog = useMutation(api.mutations.createTimeLog);

  const nextHeatNumber = useMemo(() => {
    const current = heats.find((heat) => heat.is_current);
    return current ? current.heat + 1 : 1;
  }, [heats]);

  /**
   * Handle global start timer with automatic heat increment
   * @returns {Promise<void>}
   * @throws {Error} If there is an error starting the timer
   */
  const handleGlobalStart = async (): Promise<void> => {
    if (!validateInputs("handleGlobalStart", teamA, teamB, playerA, playerB))
      return;

    const date = new Date().toISOString().split("T")[0];

    try {
      const newHeat = await startHeat({
        heat: nextHeatNumber,
        date,
        team_a_id: teamA!,
        player_a_id: playerA!,
        team_b_id: teamB!,
        player_b_id: playerB!,
      });

      alert.setOpen(true);
      alert.setSeverity("success");
      alert.setText(`Heat ${newHeat.heat} started! Global timer running.`);
      alert.setContext({
        operation: "global_start_timer",
        location: "MainJudge.handleGlobalStart",
        metadata: {
          heatNumber: newHeat.heat,
          date,
          teamA,
          playerA,
          teamB,
          playerB,
        },
      });
    } catch (error) {
      const err = "Error starting global timer: " + (error as Error).message;
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText(err);
      alert.setContext({
        operation: "global_start_timer",
        location: "MainJudge.handleGlobalStart",
        metadata: {
          step: "start_heat",
          heatNumber: nextHeatNumber,
          date,
          teamA,
          playerA,
          teamB,
          playerB,
        },
      });
    }
  };

  /**
   * Handle button click to start/stop the timers to send a row to the db
   */
  const insertTimeLog = async (
    timeTypeId: Id<"time_types">,
    player?: Id<"players"> | null,
    team?: Id<"teams">,
  ): Promise<void> => {
    const currentHeat = getCurrentHeat(heats, alert);
    if (!currentHeat) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("No current heat found");
      alert.setContext({
        operation: "record_time",
        location: "BeerJudge.insertTimeLog",
        metadata: {
          timeTypeId,
          team,
          player,
        },
      });
      return;
    }

    const isValid = validateInputs("insertTimeLog", timeTypeId, player, team);
    if (!isValid) return;

    try {
      await createTimeLog({
        team_id: team as Id<"teams">,
        player_id: player as Id<"players">,
        time_type_id: timeTypeId,
        heat_id: currentHeat.id,
      });
    } catch (error) {
      const err = "Error inserting time log: " + (error as Error).message;
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText(err);
      alert.setContext({
        operation: "record_time",
        location: "BeerJudge.insertTimeLog",
        metadata: {
          step: "insert_time_log",
          teamId: team,
          playerId: player,
          timeTypeId,
          heatId: currentHeat.id,
        },
      });
      return;
    }
    const timeTypeName =
      timeTypes.find((e) => e.id === timeTypeId)?.time_eng || "Unknown";
    alert.setOpen(true);
    alert.setSeverity("success");
    alert.setText(`Inserted log of type: ${timeTypeName}`);
    alert.setContext({
      operation: "record_time",
      location: "BeerJudge.insertTimeLog",
      metadata: {
        teamId: team,
        playerId: player,
        timeTypeId,
        timeTypeName,
        heatId: currentHeat.id,
      },
    });
  };

  const handleStartStop = async (
    prevPlayerId: Id<"players"> | null,
    playerId?: Id<"players"> | null,
    teamId?: Id<"teams">,
  ) => {
    const currentHeat = getCurrentHeat(heats, alert);
    if (!validateInputs("handleStartStop", playerId, teamId, currentHeat)) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Missing parameters");
      alert.setContext({
        operation: "start_stop_timer",
        location: "useHeatControls.handleStartStop",
      });
      return;
    }

    const timeTypeId = getTimeType(TIME_TYPE_SAIL, timeTypes)?.id;
    if (!timeTypeId) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Could not find sailing time type");
      alert.setContext({
        operation: "start_stop_timer",
        location: "useHeatControls.handleStartStop",
        metadata: {
          searchingFor: TIME_TYPE_SAIL,
          availableTimeTypes: timeTypes.map((t) => t.time_eng),
        },
      });
      return;
    }

    try {
      await createTimeLogsBatch({
        logs: [
          {
            team_id: teamId,
            player_id: prevPlayerId!,
            time_type_id: timeTypeId,
            heat_id: currentHeat!.id,
          },
          {
            team_id: teamId,
            player_id: playerId!,
            time_type_id: timeTypeId,
            heat_id: currentHeat!.id,
          },
        ],
      });
    } catch (error) {
      const err = "Error inserting time log: " + (error as Error).message;
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText(err);
      alert.setContext({
        operation: "start_stop_timer",
        location: "useHeatControls.handleStartStop",
        metadata: {
          step: "insert_time_logs",
          teamId: teamId,
          prevPlayerId,
          currentPlayerId: playerId,
          heatId: currentHeat!.id,
        },
      });
      return;
    }
    alert.setOpen(true);
    alert.setSeverity("success");
    alert.setText(
      "Inserted log of type: " +
        (timeTypes.find((e) => e.id === timeTypeId)?.time_eng || "Unknown"),
    );
    alert.setContext({
      operation: "start_stop_timer",
      location: "useHeatControls.handleStartStop",
      metadata: {
        teamId: teamId,
        prevPlayerId,
        currentPlayerId: playerId,
        heatId: currentHeat!.id,
        timeType: TIME_TYPE_SAIL,
      },
    });
  };

  /**
   * Check all inputs are present
   * Otherwise create alert
   */
  const validateInputs = (caller: string, ...lst: unknown[]): boolean => {
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

  return { nextHeatNumber, handleGlobalStart, insertTimeLog, handleStartStop };
};

export default useHeatControls;
