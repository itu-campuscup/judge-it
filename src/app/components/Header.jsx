import React from 'react';
import { AppBar, Toolbar, Button, Container } from '@mui/material';
import { supabase } from '../../SupabaseClient';

const Header = ({ user }) => {
    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Error logging out:', error.message);
    }

    return (
      <>
        <AppBar position='static'>
          <Toolbar>
            {user && <Button color='inherit' onClick={handleLogout}>Logout</Button>}
          </Toolbar>
        </AppBar>
      </>
    )
}

export default Header;
