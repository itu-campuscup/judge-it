import React from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import { supabase } from "@/SupabaseClient";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error.message);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {user && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
