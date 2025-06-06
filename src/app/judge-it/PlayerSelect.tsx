import React, { useEffect } from "react";
import {
  FormControl,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { getTeamPlayerIds, getPlayer } from "@/utils/getUtils";
import type { Team, Player } from "@/types";

interface PlayerSelectProps {
  teams: Team[];
  selectedTeamId: string;
  selectedPlayer: string;
  setSelectedPlayer: (value: string) => void;
  players: Player[];
  teamPlayers?: Player[];
  setTeamPlayers: (players: Player[]) => void;
  selectPlayerString: string;
  setSelectPlayerString: (value: string) => void;
  alert?: any;
}

const PlayerSelect: React.FC<PlayerSelectProps> = ({
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
      const teamPlayerIds = getTeamPlayerIds(selectedTeamId, teams);
      const teamPlayers = teamPlayerIds
        .map((id) => getPlayer(id, players))
        .filter((player): player is Player => player !== undefined);
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
