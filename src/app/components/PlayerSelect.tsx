import React, { useMemo } from "react";
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { getTeamPlayerIds, getPlayer } from "@/utils/getUtils";
import type { Player } from "@/types";
import { Id } from "convex/_generated/dataModel";
import useFetchDataConvex from "../hooks/useFetchDataConvex";

interface PlayerSelectProps {
  selectedTeamId: Id<"teams"> | null;
  selectedPlayer: string;
  setSelectedPlayer: (value: string) => void;
}

const PlayerSelect: React.FC<PlayerSelectProps> = ({
  selectedTeamId,
  selectedPlayer,
  setSelectedPlayer,
}) => {
  const { players, teams } = useFetchDataConvex();
  const calculatedTeamPlayers = useMemo(() => {
    if (!selectedTeamId) return [];
    const teamPlayerIds = getTeamPlayerIds(selectedTeamId, teams);
    return teamPlayerIds
      .map((id) => getPlayer(id, players))
      .filter((player): player is Player => player !== undefined);
  }, [selectedTeamId, teams, players]);

  return (
    <FormControl
      fullWidth
      margin="normal"
      variant="filled"
      disabled={calculatedTeamPlayers.length === 0}
    >
      <RadioGroup
        row
        aria-labelledby="player-select-label"
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
      >
        {calculatedTeamPlayers.map((player) => (
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
