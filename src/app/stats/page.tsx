"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  Box,
  Button,
} from "@mui/material";
import Header from "../components/Header";
import BeerChugger from "./BeerChugger";
import Sailing from "./Sailing";
import Spinner from "./Spinner";
import Contestant from "./Contestants";
import Teams from "./Teams";
import { useAuth } from "@/AuthContext";
import NotLoggedIn from "../components/NotLoggedIn";
import AlertComponent from "../components/AlertComponent";
import useFetchData from "../hooks/useFetchData";
import CurrentHeat from "./CurrentHeat";

type SelectedStat =
  | "BeerChugger"
  | "Sailing"
  | "Spinner"
  | "Contestants"
  | "Teams"
  | "Heat";

const STATS_CONFIG = [
  { key: "BeerChugger", label: "Beer Chugger", number: 1 },
  { key: "Sailing", label: "Sailing", number: 2 },
  { key: "Spinner", label: "Spinner", number: 3 },
  { key: "Contestants", label: "Contestants", number: 4 },
  { key: "Teams", label: "Teams", number: 5 },
  { key: "Heat", label: "Heat", number: 6 },
] as const;

function Stats() {
  const { user } = useAuth();
  const [selectedStat, setSelectedStat] = useState<SelectedStat>("BeerChugger");
  const { players, heats, teams, timeTypes, timeLogs, alert } = useFetchData();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      const statConfig = STATS_CONFIG.find(
        (stat) => stat.number.toString() === key
      );

      if (statConfig) {
        setSelectedStat(statConfig.key as SelectedStat);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  if (!user) {
    return <NotLoggedIn />;
  }

  const renderSelectedStat = () => {
    const commonProps = {
      timeLogs,
      players,
      timeTypes,
      teams,
      heats,
    };
    switch (selectedStat) {
      case "BeerChugger":
        return <BeerChugger {...commonProps} />;
      case "Sailing":
        return <Sailing {...commonProps} />;
      case "Spinner":
        return <Spinner {...commonProps} />;
      case "Contestants":
        return <Contestant {...commonProps} />;
      case "Teams":
        return <Teams {...commonProps} />;
      case "Heat":
        return <CurrentHeat alert={undefined} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Header user={user} />
      <AppBar position="static" sx={{ mb: 3, backgroundColor: "primary.main" }}>
        <Toolbar>
          <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
            {STATS_CONFIG.map((stat) => (
              <Button
                key={stat.key}
                onClick={() => setSelectedStat(stat.key as SelectedStat)}
                variant={selectedStat === stat.key ? "contained" : "text"}
                sx={{
                  color:
                    selectedStat === stat.key
                      ? "primary.contrastText"
                      : "white",
                  backgroundColor:
                    selectedStat === stat.key
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                  minWidth: "auto",
                  px: 2,
                  py: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="h6"
                  component="span"
                  sx={{ fontWeight: "bold" }}
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant="caption"
                  component="span"
                  sx={{ fontSize: "0.75rem" }}
                >
                  {stat.label}
                </Typography>
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2, mb: 2 }}>
        {renderSelectedStat()}
      </Paper>

      <AlertComponent
        open={alert.open}
        severity={alert.severity}
        text={alert.text}
        setOpen={alert.setOpen}
      />
    </Container>
  );
}

export default Stats;
