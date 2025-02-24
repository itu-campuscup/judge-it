'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../SupabaseClient';
import { useAuth } from '../AuthContext';
import { Button, TextField, Box, Typography, Card, CardContent, Container, AppBar, Toolbar } from '@mui/material';
import Header from './components/Header';
import HCaptcha from '@hcaptcha/react-hcaptcha';

function Home() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hcaptchaToken, setHcaptchaToken] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!hcaptchaToken) {
      console.error('Please complete the captcha');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error('Error logging in:', error.message);
  };

  const handleHcaptchaVerify = (token) => {
    setHcaptchaToken(token);
  };

  if (user) {
    return (
      <Container>
        <Header user={user} />
        <Box>
          <Typography variant='h3'>Welcome, {user.email}</Typography>
          <Typography>You are authenticated!</Typography>
          <nav>
            <Link href='/stats'>
              <Button variant='contained' color='primary'>Go to stats page</Button>
            </Link>
            <Link href='/judge-it'>
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
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                onVerify={handleHcaptchaVerify}
              />
              <Button type='submit' variant='contained' color='primary'>Login</Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Home;
