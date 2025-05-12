import React, { useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { getActiveTeams } from "@/utils/getUtils";

/**
 * Show a dropdown to select an available team
 * @param {Object} selectedTeam, setSelectedTeam, teams, alert
 * @returns {JSX.Element}
 */
const TeamSelect = ({ selectedTeamId, setSelectedTeam, teams, alert }) => {
  const activeTeams = getActiveTeams(teams);

  useEffect(() => {
    if (activeTeams.length === 0 && alert) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("No active teams found");
    }
    console.log("Team given: ", teams);
  }, [teams, activeTeams, alert]);

  return (
    <FormControl fullWidth margin="normal" variant="filled">
      <InputLabel id="team-select-label">Select Team</InputLabel>
      <Select
        labelId="team-select-label"
        value={selectedTeamId}
        onChange={(e) => setSelectedTeam(e.target.value)}
      >
        {activeTeams.map((team) => (
          <MenuItem key={team.id} value={team.id}>
            {team.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TeamSelect;
