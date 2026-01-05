"use client";

import { useState, useEffect, useMemo } from "react";
import { Typography, AppBar, Toolbar, Paper, Box, Button } from "@mui/material";
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

  // Memoize props object to prevent unnecessary re-renders of stat components
  const commonProps = useMemo(
    () => ({
      timeLogs,
      players,
      timeTypes,
      teams,
      heats,
    }),
    [timeLogs, players, timeTypes, teams, heats]
  );

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
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Header user={user} />
      <AppBar
        position="static"
        sx={{ backgroundColor: "primary.main", flexShrink: 0 }}
      >
        <Toolbar sx={{ minHeight: "60px !important" }}>
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
                  px: 1.5,
                  py: 0.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.25,
                  height: "50px",
                }}
              >
                <Typography
                  variant="h6"
                  component="span"
                  sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant="caption"
                  component="span"
                  sx={{ fontSize: "0.75rem", fontWeight: "medium" }}
                >
                  {stat.label}
                </Typography>
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          m: 1,
          p: 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Box sx={{ flex: 1, overflow: "auto" }}>{renderSelectedStat()}</Box>
      </Paper>

      <AlertComponent
        open={alert.open}
        severity={alert.severity}
        text={alert.text}
        setOpen={alert.setOpen}
      />
    </Box>
  );
}

export default Stats;
