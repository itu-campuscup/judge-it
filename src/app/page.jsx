'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../SupabaseClient';
import { useAuth } from '../AuthContext';
import { Button, TextField, Box, Typography, Card, CardContent, Container } from '@mui/material';
import Header from './components/Header';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import AlertComponent from './components/AlertComponent';

function Home() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hcaptchaToken, setHcaptchaToken] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [alertText, setAlertText] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (process.env.NODE_ENV !== 'development' && !hcaptchaToken) {
      const err = 'Please complete the captcha';
      setAlertOpen(true);
      setAlertSeverity('error');
      setAlertText(err);
      console.error('Please complete the captcha');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken: process.env.NODE_ENV === 'development' ? 'dummy-token' : hcaptchaToken,
      },
    });
    if (error) {
      const err = 'Error logging in: ' + error.message;
      setAlertOpen(true);
      setAlertSeverity('error');
      setAlertText(err);
      console.error(err);
    }
  };

  const handleHcaptchaVerify = (token) => {
    console.log('hCaptcha token:', token);
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
      <AlertComponent
        open={alertOpen}
        severity={alertSeverity}
        text={alertText}
        setOpen={setAlertOpen}
      />
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
              {process.env.NODE_ENV !== 'development' && (
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                  onVerify={handleHcaptchaVerify}
                />
              )}
              <Button type='submit' variant='contained' color='primary'>Login</Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Home;
