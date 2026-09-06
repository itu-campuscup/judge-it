import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useMemo, useState } from "react";
import { Heat, Team, TimeLog } from "@/types";
import { Id } from "convex/_generated/dataModel";

const asDate = (t?: number) => {
  if (!t) return undefined;
  return new Date(t).toISOString();
};

const asDataModel = (o?: any) => {
  if (!o) return undefined;
  return {
    ...o,
    id: o._id,
    created_at: asDate(o._creationTime),
  };
};

const useCurrentHeat = () => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const heat = useQuery(api.queries.getCurrentHeat, {});

  const timeLogs = useQuery(
    api.queries.getTimeLogsByHeat,
    !heat ? "skip" : { heatId: heat._id },
  );

  const teamIds = useMemo(() => {
    if (!timeLogs) return [];
    const teamIds = new Set(timeLogs.map((tl) => tl.team_id));
    return [...teamIds].filter((id) => id !== undefined);
  }, [timeLogs]);

  const teamA = useQuery(
    api.queries.getTeam,
    teamIds.length !== 2
      ? "skip"
      : {
          id: teamIds[0],
        },
  );
  const teamB = useQuery(
    api.queries.getTeam,
    teamIds.length !== 2
      ? "skip"
      : {
          id: teamIds[1],
        },
  );

  const setSelectedTeamId = (id: Id<"teams"> | null) => {
    if (teamA?._id === id) {
      setSelectedTeam(asDataModel(teamA));
    } else if (teamB?._id === id) {
      setSelectedTeam(asDataModel(teamB));
    } else {
      setSelectedTeam(null);
    }
  };

  return {
    currentHeat: heat ? (asDataModel(heat) as Heat) : undefined,
    timeLogs: timeLogs?.map((tl) => asDataModel(tl) as TimeLog) ?? [],
    competingTeams: [teamA, teamB]
      .filter((t) => !!t)
      .map((t) => asDataModel(t) as Team),
    selectedTeam,
    setSelectedTeamId,
    setSelectedTeam,
  };
};

export default useCurrentHeat;
