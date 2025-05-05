import React, { useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';

const AlertComponent = ({ severity, text, open, setOpen }) => {
  useEffect(() => {
    if (open) {
      const playSound = () => {
        let audio;
        switch (severity) {
          case 'success':
            audio = new Audio('/sounds/confirmation.mp3');
            break;
          case 'error':
          case 'warning':
            audio = new Audio('/sounds/error.mp3');
            break;
        }
        audio.play();
      }

      // playSound();

      const timer = setTimeout(() => {
        setOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, severity, setOpen]);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={() => setOpen(false)}
    >
      <Alert onClose={() => setOpen(false)} variant='filled' severity={severity} sx={{ width: '100%' }}>
        {text}
      </Alert>
    </Snackbar>
  );
};

export default AlertComponent;
