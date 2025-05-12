import React, { useEffect } from "react";
import {
  FormControl,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { getPlayerIdsGivenTeamId, getPlayerGivenId } from "@/utils/getUtils";

const PlayerSelect = ({
  teams,
  selectedTeamId,
  selectedPlayer,
  setSelectedPlayer,
  players,
  teamPlayers = [],
  setTeamPlayers,
  selectPlayerString,
  setSelectPlayerString,
}) => {
  useEffect(() => {
    if (selectedTeamId) {
      console.log("selectedTeam", selectedTeamId);
      const teamPlayerIds = getPlayerIdsGivenTeamId(selectedTeamId, teams);
      const teamPlayers = teamPlayerIds.map((id) =>
        getPlayerGivenId(id, players)
      );
      setTeamPlayers(teamPlayers);
    }
  }, [teams, selectedTeamId, players, setTeamPlayers]);

  useEffect(() => {
    if (teamPlayers.length === 0) {
      setSelectPlayerString("No players found");
    } else {
      setSelectPlayerString("Select Player");
    }
  }, [teamPlayers, setSelectPlayerString]);

  return (
    <FormControl
      fullWidth
      margin="normal"
      variant="filled"
      disabled={teamPlayers.length === 0}
    >
      <Typography id="player-select-label">{selectPlayerString}</Typography>
      <RadioGroup
        row
        aria-labelledby="player-select-label"
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
      >
        {teamPlayers &&
          teamPlayers.map((player) => (
            <FormControlLabel
              key={player.id}
              value={player.id}
              control={<Radio />}
              label={player.name}
            />
          ))}
      </RadioGroup>
    </FormControl>
  );
};

export default PlayerSelect;
