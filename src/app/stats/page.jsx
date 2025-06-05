"use client";

import { useState } from "react";
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
import { useAuth } from "@/AuthContext";
import NotLoggedIn from "../components/NotLoggedIn";
import AlertComponent from "../components/AlertComponent";
import useFetchData from "../hooks/useFetchData";

function Stats() {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStat, setSelectedStat] = useState("BeerChugger");
  const BEER_CHUGGER_STAT = "BeerChugger";
  const SAILING_STAT = "Sailing";
  const SPINNER_STAT = "Spinner";

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (stat) => {
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
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="maxWidth">
      <Header user={user} />
      <AppBar position="static" sx={{ mb: 3, backgroundColor: "primary.main" }}>
        {" "}
        {/* Added margin-bottom and a distinct background */}
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
          </Menu>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {" "}
            {/* Added component="div" and flexGrow */}
            {selectedStat} Stats {/* Display the name of the selected stat */}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main content area for stats */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2, mb: 2 }}>
        {" "}
        {/* Added Paper for better visual grouping and padding */}
        {renderSelectedStat()}
      </Paper>

      <AlertComponent
        open={alert.open}
        severity={alert.severity}
        text={alert.text}
        setOpen={alert.setOpen} // Assuming alert object has setOpen method
      />
    </Container>
  );
}

export default Stats;
