"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import { useAuth } from "@/AuthContext";
import AlertComponent from "../components/AlertComponent";
import Header from "../components/Header";
import NotLoggedIn from "../components/NotLoggedIn";
import { RequireApproval } from "../components/RequireApproval";
import useFetchDataConvex from "../hooks/useFetchDataConvex";
import ContestantForm from "./ContestantForm";
import TeamForm from "./TeamForm";
import TeamStatusList from "./TeamStatusList";

function ManagementPage() {
  const { user } = useAuth();
  const { alert, players, teams } = useFetchDataConvex();

  if (!user) {
    return <NotLoggedIn />;
  }

  return (
    <Container maxWidth="md">
      <Header />
      <Stack spacing={3} sx={{ py: 3 }}>
        <Box>
          <Typography component="h1" variant="h3">
            Manage competition
          </Typography>
          <Typography color="text.secondary">
            Create contestants and teams, then mark teams as active or out.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            alignItems: "start",
          }}
        >
          <ContestantForm alert={alert} />
          <TeamForm alert={alert} players={players} />
        </Box>
        <TeamStatusList alert={alert} teams={teams} />
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

export default function ManagementPageWithApproval() {
  return (
    <RequireApproval>
      <ManagementPage />
    </RequireApproval>
  );
}
