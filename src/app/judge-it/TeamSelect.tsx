import React, { useEffect, useMemo } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { getActiveTeams } from "@/utils/getUtils";
import type { Team } from "@/types";
import { Id } from "convex/_generated/dataModel";
import useFetchDataConvex from "../hooks/useFetchDataConvex";

interface TeamSelectProps {
  selectedTeamId: Id<"teams"> | null;
  setSelectedTeam: (value: Id<"teams"> | null) => void;
}

/**
 * Show a dropdown to select an available team
 * @param {TeamSelectProps} props
 * @returns {JSX.Element}
 */
const TeamSelect: React.FC<TeamSelectProps> = ({
  selectedTeamId,
  setSelectedTeam,
}) => {
  const { alert, teams } = useFetchDataConvex();
  const activeTeams = useMemo(() => getActiveTeams(teams), [teams]);

  useEffect(() => {
    if (activeTeams.length === 0) {
      alert.setOpen(true);
      alert.setSeverity("warning");
      alert.setText("No active teams found");
      alert.setContext({
        operation: "load_teams",
        location: "TeamSelect.useEffect",
        metadata: {
          totalTeams: teams.length,
          activeTeams: 0,
        },
      });
    }
  }, [activeTeams]);

  return (
    <FormControl fullWidth margin="normal" variant="filled">
      <InputLabel id="team-select-label">Select Team</InputLabel>
      <Select
        labelId="team-select-label"
        value={selectedTeamId}
        onChange={(e) => setSelectedTeam(e.target.value as Id<"teams">)}
      >
        {activeTeams.map((team: Team) => (
          <MenuItem key={team.id} value={team.id}>
            {team.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TeamSelect;
