import React from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { supabase } from "@/SupabaseClient";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuToggle = (event?: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event ? event.currentTarget : null);
  };

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ minHeight: "36px !important", py: 0.5 }}>
          {user && (
            <>
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
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleMenuToggle();
                    handleLogout();
                  }}
                  sx={{ fontSize: "0.875rem", py: 0.5 }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default React.memo(Header);
