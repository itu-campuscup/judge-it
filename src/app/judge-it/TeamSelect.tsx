import React, { useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { getActiveTeams } from "@/utils/getUtils";
import type { Team } from "@/types";

interface TeamSelectProps {
  selectedTeamId: string;
  setSelectedTeam: (value: string) => void;
  teams: Team[];
  alert?: any;
}

/**
 * Show a dropdown to select an available team
 * @param {TeamSelectProps} props
 * @returns {JSX.Element}
 */
const TeamSelect: React.FC<TeamSelectProps> = ({
  selectedTeamId,
  setSelectedTeam,
  teams,
  alert,
}) => {
  const activeTeams = getActiveTeams(teams);

  useEffect(() => {
    if (activeTeams.length === 0 && alert) {
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
  }, [teams, activeTeams, alert]);

  return (
    <FormControl fullWidth margin="normal" variant="filled">
      <InputLabel id="team-select-label">Select Team</InputLabel>
      <Select
        labelId="team-select-label"
        value={selectedTeamId}
        onChange={(e) => setSelectedTeam(e.target.value)}
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
