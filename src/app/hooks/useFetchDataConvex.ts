"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type {
  Player,
  Heat,
  Team,
  TimeType,
  TimeLog,
  AlertContext,
} from "@/types";
import { createLogger } from "@/observability";
import { useAuth } from "@/AuthContext";
import { Id, TableNames } from "../../../convex/_generated/dataModel";
import { SystemTableNames } from "convex/server";

interface UseFetchDataReturn {
  players: Player[];
  heats: Heat[];
  teams: Team[];
  timeTypes: TimeType[];
  timeLogs: TimeLog[];
  alert: {
    open: boolean;
    severity: "error" | "success" | "info" | "warning";
    text: string;
    context?: AlertContext;
    setOpen: (open: boolean) => void;
    setSeverity: (severity: "error" | "success" | "info" | "warning") => void;
    setText: (text: string) => void;
    setContext: (context: AlertContext | undefined) => void;
  };
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch data from Convex and listen for real-time changes
 * This replaces the Supabase useFetchData hook with Convex queries
 *
 * @returns {UseFetchDataReturn} players, heats, teams, timeTypes, timeLogs, alert, loading, and error
 */
export const useFetchDataConvex = (): UseFetchDataReturn => {
  const { user } = useAuth();
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<
    "error" | "success" | "info" | "warning"
  >("error");
  const [alertText, setAlertText] = useState<string>("");
  const [alertContext, setAlertContext] = useState<AlertContext | undefined>();

  // Create logger for this endpoint
  const logger = useMemo(() => createLogger("useFetchDataConvex"), []);

  // Update logger's user context when user changes
  useEffect(() => {
    logger.setUser(user);
  }, [user, logger]);

  // Fetch all data using Convex queries - these automatically subscribe to changes
  const convexPlayers = useQuery(api.queries.getPlayers) ?? [];
  const convexHeats = useQuery(api.queries.getHeats) ?? [];
  const convexTeams = useQuery(api.queries.getTeams) ?? [];
  const convexTimeTypes = useQuery(api.queries.getTimeTypes) ?? [];
  const convexTimeLogs = useQuery(api.queries.getTimeLogs) ?? [];

  // Convert Convex data to match existing interfaces
  const players: Player[] = convexPlayers.map((p) => ({
    id: convertIdToNumber(p._id),
    name: p.name,
    image_url: p.image_url,
    fun_fact: p.fun_fact,
    created_at: p._creationTime
      ? new Date(p._creationTime).toISOString()
      : undefined,
  }));

  const heats: Heat[] = convexHeats.map((h) => ({
    id: convertIdToNumber(h._id),
    name: h.name,
    heat: h.heat,
    date: h.date,
    is_current: h.is_current,
    created_at: h._creationTime
      ? new Date(h._creationTime).toISOString()
      : undefined,
  }));

  const teams: Team[] = convexTeams.map((t) => ({
    id: convertIdToNumber(t._id),
    name: t.name,
    player_1_id: t.player_1_id ? convertIdToNumber(t.player_1_id) : undefined,
    player_2_id: t.player_2_id ? convertIdToNumber(t.player_2_id) : undefined,
    player_3_id: t.player_3_id ? convertIdToNumber(t.player_3_id) : undefined,
    player_4_id: t.player_4_id ? convertIdToNumber(t.player_4_id) : undefined,
    image_url: t.image_url,
    is_out: t.is_out,
    created_at: t._creationTime
      ? new Date(t._creationTime).toISOString()
      : undefined,
  }));

  const timeTypes: TimeType[] = convexTimeTypes.map((tt) => ({
    id: convertIdToNumber(tt._id),
    name: tt.name,
    time_eng: tt.time_eng,
    description: tt.description,
  }));

  const timeLogs: TimeLog[] = convexTimeLogs.map((tl) => ({
    id: convertIdToNumber(tl._id),
    player_id: convertIdToNumber(tl.player_id),
    team_id: tl.team_id ? convertIdToNumber(tl.team_id) : undefined,
    heat_id: convertIdToNumber(tl.heat_id),
    time_type_id: convertIdToNumber(tl.time_type_id),
    time_seconds: tl.time_seconds,
    time: tl.time,
    created_at: tl._creationTime
      ? new Date(tl._creationTime).toISOString()
      : undefined,
  }));

  // Determine loading state - if any query is undefined, we're still loading
  const loading =
    convexPlayers === undefined ||
    convexHeats === undefined ||
    convexTeams === undefined ||
    convexTimeTypes === undefined ||
    convexTimeLogs === undefined;

  // Log initial fetch completion
  useEffect(() => {
    if (!loading) {
      logger.info("initial_fetch_complete", {
        playerCount: players.length,
        heatCount: heats.length,
        teamCount: teams.length,
        timeTypeCount: timeTypes.length,
        timeLogCount: timeLogs.length,
      });
    }
  }, [
    loading,
    players.length,
    heats.length,
    teams.length,
    timeTypes.length,
    timeLogs.length,
    logger,
  ]);

  return {
    players,
    heats,
    teams,
    timeTypes,
    timeLogs,
    alert: {
      open: alertOpen,
      severity: alertSeverity,
      text: alertText,
      context: alertContext,
      setOpen: setAlertOpen,
      setSeverity: setAlertSeverity,
      setText: setAlertText,
      setContext: setAlertContext,
    },
    loading,
    error: null, // Convex handles errors differently - queries will throw or return undefined
  };
};

/**
 * Helper to convert Convex ID to number for backwards compatibility
 * This is a temporary solution until we fully migrate to Convex IDs
 */
function convertIdToNumber<T extends TableNames | SystemTableNames>(
  id: Id<T>,
): number {
  // Extract a consistent number from the Convex ID string
  // This is a hash function that generates a stable number from the ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Default export for backwards compatibility
export default useFetchDataConvex;
