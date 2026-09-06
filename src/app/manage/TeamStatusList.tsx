"use client";

import { useState } from "react";
import {
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import type { AlertObject, Team } from "@/types";

interface TeamStatusListProps {
  alert: AlertObject;
  teams: Team[];
}

export default function TeamStatusList({ alert, teams }: TeamStatusListProps) {
  const updateTeam = useMutation(api.mutations.updateTeam);
  const [updatingTeamId, setUpdatingTeamId] = useState<Id<"teams"> | null>(
    null,
  );

  const setTeamOut = async (team: Team, isOut: boolean) => {
    setUpdatingTeamId(team.id);

    try {
      await updateTeam({ id: team.id, is_out: isOut });
      alert.setOpen(true);
      alert.setSeverity("success");
      alert.setText(`${team.name} is now ${isOut ? "out" : "active"}`);
      alert.setContext({
        operation: "update_team_status",
        location: "manage.TeamStatusList",
        metadata: { teamId: team.id, isOut },
      });
    } catch (error) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Could not update team: " + (error as Error).message);
      alert.setContext({
        operation: "update_team_status",
        location: "manage.TeamStatusList",
        metadata: { teamId: team.id, isOut },
        error: error as Error,
      });
    } finally {
      setUpdatingTeamId(null);
    }
  };

  return (
    <Paper component="section" variant="outlined" sx={{ p: 3 }}>
      <Typography component="h2" variant="h5" gutterBottom>
        Team status
      </Typography>
      {teams.length === 0 ? (
        <Typography color="text.secondary">No teams created yet.</Typography>
      ) : (
        <Stack spacing={1}>
          {teams.map((team) => (
            <FormControlLabel
              key={team.id}
              label={`${team.name} — ${team.is_out ? "Out" : "Active"}`}
              control={
                <Switch
                  checked={team.is_out === true}
                  disabled={updatingTeamId !== null}
                  onChange={(_, checked) => setTeamOut(team, checked)}
                  inputProps={{
                    "aria-label": `Mark ${team.name} as ${team.is_out ? "active" : "out"}`,
                  }}
                />
              }
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
}
