"use client";

import React, { useState, useMemo } from "react";
import {
  Container,
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "@/AuthContext";
import MainJudge from "./MainJudge";
import Header from "../components/Header";
import ParticipantsJudge from "./ParticipantsJudge";
import BeerJudge from "./BeerJudge";
import NotLoggedIn from "../components/NotLoggedIn";
import AlertComponent from "../components/AlertComponent";
import useFetchDataConvex from "../hooks/useFetchDataConvex";
import { RequireApproval } from "../components/RequireApproval";
import JudgeTypeRadio, { judge } from "../components/JudgeTypeRadio";

export const dynamic = "force-dynamic";

function Judge(): React.ReactElement {
  const { user } = useAuth();
  const [judgeType, setJudgeType] = useState<judge>(judge.NONE);
  const { alert, reload, lastReloaded } = useFetchDataConvex();

  const reloadTooltip = useMemo(
    () => `Reload data (Last: ${new Date(lastReloaded).toLocaleTimeString()})`,
    [lastReloaded],
  );

  if (!user) {
    return <NotLoggedIn />;
  }

  return (
    <Container maxWidth="md">
      <Header />
      <Stack
        spacing={2}
        sx={{
          minHeight: "calc(100vh - 80px)",
          maxHeight: "calc(100vh - 80px)",
          overflowY: "auto",
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Typography variant="h3" align="center">
            Judge Page
          </Typography>
          <Tooltip title={reloadTooltip}>
            <IconButton
              onClick={reload}
              color="primary"
              size="large"
              sx={{
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <JudgeTypeRadio
          selectedType={judgeType}
          setSelectedType={setJudgeType}
        />

        {/**
         * Display the specific judge extra functionality
         *
         * Loads main.jsx if judgeType is main
         * Loads participants.jsx if judgeType is participants side
         * Loads beer.jsx if judgeType is beer side
         */}
        {judgeType === judge.MAIN && <MainJudge />}
        {judgeType === judge.PARTICIPANTS && <ParticipantsJudge />}
        {judgeType === judge.BEER && <BeerJudge />}
      </Stack>
      <AlertComponent
        severity={alert.severity}
        text={alert.text}
        open={alert.open}
        setOpen={alert.setOpen}
        context={alert.context}
      />
    </Container>
  );
}

function JudgeWithApproval() {
  return (
    <RequireApproval>
      <Judge />
    </RequireApproval>
  );
}

export default JudgeWithApproval;
