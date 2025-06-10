"use client";

import { useState, MouseEvent } from "react";
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Paper,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
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

type SelectedStat =
  | "BeerChugger"
  | "Sailing"
  | "Spinner"
  | "Contestants"
  | "Teams";

function Stats() {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStat, setSelectedStat] = useState<SelectedStat>("BeerChugger");
  const BEER_CHUGGER_STAT: SelectedStat = "BeerChugger";
  const SAILING_STAT: SelectedStat = "Sailing";
  const SPINNER_STAT: SelectedStat = "Spinner";
  const CONTESTANT_STAT: SelectedStat = "Contestants";
  const TEAM_STAT: SelectedStat = "Teams";

  const handleMenuOpen = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (stat: SelectedStat): void => {
    setSelectedStat(stat);
    handleMenuClose();
  };

  const { players, heats, teams, timeTypes, timeLogs, alert } = useFetchData();

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
      case BEER_CHUGGER_STAT:
        return <BeerChugger {...commonProps} />;
      case SAILING_STAT:
        return <Sailing {...commonProps} />;
      case SPINNER_STAT:
        return <Spinner {...commonProps} />;
      case CONTESTANT_STAT:
        return <Contestant {...commonProps} />;
      case TEAM_STAT:
        return <Teams {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Header user={user} />
      <AppBar position="static" sx={{ mb: 3, backgroundColor: "primary.main" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            aria-controls="stats-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="stats-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            keepMounted
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <MenuItem
              onClick={() => handleMenuItemClick(BEER_CHUGGER_STAT)}
              selected={selectedStat === BEER_CHUGGER_STAT}
            >
              Beer Chugger
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuItemClick(SAILING_STAT)}
              selected={selectedStat === SAILING_STAT}
            >
              Sailing
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuItemClick(SPINNER_STAT)}
              selected={selectedStat === SPINNER_STAT}
            >
              Spinner
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuItemClick(CONTESTANT_STAT)}
              selected={selectedStat === CONTESTANT_STAT}
            >
              Contestants
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuItemClick(TEAM_STAT)}
              selected={selectedStat === TEAM_STAT}
            >
              Teams
            </MenuItem>
          </Menu>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {selectedStat} Stats
          </Typography>
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
