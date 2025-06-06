import { useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";

interface AlertComponentProps {
  severity: "success" | "error" | "warning" | "info";
  text: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertComponent: React.FC<AlertComponentProps> = ({
  severity,
  text,
  open,
  setOpen,
}) => {
  useEffect(() => {
    if (open) {
      const playSound = () => {
        let audio: HTMLAudioElement;
        switch (severity) {
          case "success":
            audio = new Audio("/sounds/confirmation.mp3");
            break;
          case "error":
          case "warning":
            audio = new Audio("/sounds/error.mp3");
            break;
          default:
            return;
        }
        audio.play();
      };

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
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={() => setOpen(false)}
    >
      <Alert
        onClose={() => setOpen(false)}
        variant="filled"
        severity={severity}
        sx={{ width: "100%" }}
      >
        {text}
      </Alert>
    </Snackbar>
  );
};

export default AlertComponent;
