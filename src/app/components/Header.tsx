import React from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Divider,
  Box,
} from "@mui/material";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuToggle = (event?: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event ? event.currentTarget : null);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ minHeight: "36px !important", py: 0.5 }}>
          <SignedIn>
            <Button
              color="inherit"
              onClick={handleMenuToggle}
              size="small"
              sx={{
                fontSize: "0.75rem",
                px: 1,
                py: 0.25,
                minHeight: "28px",
              }}
            >
              Menu
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => handleMenuToggle()}
            >
              <MenuItem
                onClick={() => handleMenuToggle()}
                sx={{ fontSize: "0.875rem", py: 0.5 }}
              >
                <Link
                  href="/stats"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Stats Page
                </Link>
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuToggle()}
                sx={{ fontSize: "0.875rem", py: 0.5 }}
              >
                <Link
                  href="/judge-it"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Judge Page
                </Link>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
            </Menu>
            <Box sx={{ marginLeft: "auto" }}>
              <UserButton afterSignOutUrl="/" />
            </Box>
          </SignedIn>
          <SignedOut>
            <Box sx={{ display: "flex", gap: 1, marginLeft: "auto" }}>
              <SignInButton mode="modal">
                <Button
                  color="inherit"
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    px: 1,
                    py: 0.25,
                    minHeight: "28px",
                  }}
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  color="inherit"
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    px: 1,
                    py: 0.25,
                    minHeight: "28px",
                  }}
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </Box>
          </SignedOut>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default React.memo(Header);
