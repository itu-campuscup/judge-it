"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  Autocomplete,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import type { AlertObject, Player } from "@/types";
import { availableContestantsForSlot, buildTeamPayload } from "./formValues";

interface TeamFormProps {
  alert: AlertObject;
  players: Player[];
}

const EMPTY_PLAYER_IDS: Array<Id<"players"> | ""> = ["", "", "", ""];

export default function TeamForm({ alert, players }: TeamFormProps) {
  const createTeam = useMutation(api.mutations.createTeam);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [playerIds, setPlayerIds] = useState(EMPTY_PLAYER_IDS);
  const [submitting, setSubmitting] = useState(false);

  const selectPlayer = (slot: number, player: Player | null) => {
    const nextPlayerIds = [...playerIds];
    nextPlayerIds[slot] = player?.id ?? "";
    setPlayerIds(nextPlayerIds);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = buildTeamPayload({ name, imageUrl, playerIds });
      await createTeam(payload);
      setName("");
      setImageUrl("");
      setPlayerIds([...EMPTY_PLAYER_IDS]);
      alert.setOpen(true);
      alert.setSeverity("success");
      alert.setText(`Created team ${payload.name}`);
      alert.setContext({
        operation: "create_team",
        location: "manage.TeamForm",
        metadata: { teamName: payload.name },
      });
    } catch (error) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Could not create team: " + (error as Error).message);
      alert.setContext({
        operation: "create_team",
        location: "manage.TeamForm",
        error: error as Error,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper component="section" variant="outlined" sx={{ p: 3 }}>
      <Typography component="h2" variant="h5" gutterBottom>
        Create team
      </Typography>
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          required
          label="Team name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          type="url"
          label="Team image URL"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
        />
        {playerIds.map((selectedPlayerId, slot) => {
          const label = `Contestant ${slot + 1}`;
          const selectedPlayer =
            players.find((player) => player.id === selectedPlayerId) ?? null;

          return (
            <Autocomplete
              key={label}
              options={availableContestantsForSlot(players, playerIds, slot)}
              value={selectedPlayer}
              getOptionKey={(player) => player.id}
              getOptionLabel={(player) => player.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, player) => selectPlayer(slot, player)}
              renderInput={(params) => <TextField {...params} label={label} />}
            />
          );
        })}
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? "Creating…" : "Create team"}
        </Button>
      </Stack>
    </Paper>
  );
}
