"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { AlertObject } from "@/types";
import { buildContestantPayload } from "./formValues";

interface ContestantFormProps {
  alert: AlertObject;
}

export default function ContestantForm({ alert }: ContestantFormProps) {
  const createPlayer = useMutation(api.mutations.createPlayer);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [funFact, setFunFact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = buildContestantPayload({ name, imageUrl, funFact });
      await createPlayer(payload);
      setName("");
      setImageUrl("");
      setFunFact("");
      alert.setOpen(true);
      alert.setSeverity("success");
      alert.setText(`Created contestant ${payload.name}`);
      alert.setContext({
        operation: "create_contestant",
        location: "manage.ContestantForm",
        metadata: { contestantName: payload.name },
      });
    } catch (error) {
      alert.setOpen(true);
      alert.setSeverity("error");
      alert.setText("Could not create contestant: " + (error as Error).message);
      alert.setContext({
        operation: "create_contestant",
        location: "manage.ContestantForm",
        error: error as Error,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper component="section" variant="outlined" sx={{ p: 3 }}>
      <Typography component="h2" variant="h5" gutterBottom>
        Create contestant
      </Typography>
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          required
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          type="url"
          label="Image URL"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
        />
        <TextField
          label="Fun fact"
          multiline
          minRows={2}
          value={funFact}
          onChange={(event) => setFunFact(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? "Creating…" : "Create contestant"}
        </Button>
      </Stack>
    </Paper>
  );
}
