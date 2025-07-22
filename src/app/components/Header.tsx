import React from "react";
import { AppBar, Toolbar, Button, Menu, MenuItem, Divider } from "@mui/material";
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
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error.message);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {user && (
            <>
              <Button color="inherit" onClick={handleMenuToggle}>
                Menu
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => handleMenuToggle()}
              >
                <MenuItem onClick={() => handleMenuToggle()}>
                  <Link href="/stats" style={{ textDecoration: "none", color: "inherit" }}>
                    Stats Page
                  </Link>
                </MenuItem>
                <MenuItem onClick={() => handleMenuToggle()}>
                  <Link href="/judge-it" style={{ textDecoration: "none", color: "inherit" }}>
                    Judge Page
                  </Link>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => {handleMenuToggle();handleLogout();}}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
