'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../SupabaseClient';
import { useAuth } from '../AuthContext';
import { Button, TextField, Box, Typography, Card, CardContent, Container, AppBar, Toolbar } from '@mui/material';

export default function Home() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error('Error logging in:', error.message);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error.message);
  }

  if (user) {
    return (
      <Container>
        <AppBar position='static'>
          <Toolbar>
            {user && (
              <Button color='inherit' onClick={handleLogout}>Logout</Button>
            )}
          </Toolbar>
        </AppBar>
        <Box>
          <Typography variant='h1'>Welcome, {user.email}</Typography>
          <Typography>You are authenticated!</Typography>
          <nav>
            <Link href='/stats'>
              <Button variant='contained' color='primary'>Go to stats page</Button>
            </Link>
            <Link href='/judge'>
              <Button variant='contained' color='primary'>Go to judge page</Button>
            </Link>
          </nav>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box>
        <Image
          src='/next.svg'
          alt='Next.js logo'
          width={180}
          height={38}
          priority
        />
        <Card>
          <CardContent>
            <form onSubmit={handleLogin}>
              <TextField
                type='email'
                label='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin='normal'
              />
              <TextField
                type='password'
                label='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin='normal'
              />
              <Button type='submit' variant='contained' color='primary'>Login</Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
