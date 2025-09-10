import { useEffect, useRef } from "react";
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
  const audioRef = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  // Load audio files once
  useEffect(() => {
    audioRef.current["success"] = new Audio("/sounds/confirmation.mp3");
    audioRef.current["error"] = new Audio("/sounds/error.mp3");

    // Set volume and preload
    Object.values(audioRef.current).forEach((audio) => {
      if (audio) {
        audio.volume = 0.5;
        audio.preload = "auto";
      }
    });

    const enableAudio = () => {
      Object.values(audioRef.current).forEach((audio) => {
        audio
          ?.play()
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
          })
          .catch((_) => {});
      });
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };

    document.addEventListener("click", enableAudio);
    document.addEventListener("touchstart", enableAudio);

    return () => {
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const playSound = () => {
        try {
          let audio: HTMLAudioElement;
          switch (severity) {
            case "success":
              audio = audioRef.current["success"]!;
              break;
            case "error":
            case "warning":
              audio = audioRef.current["error"]!;
              break;
            default:
              return;
          }
          audio.play();
        } catch (error) {
          console.error("Sound error: ", error);
        }
      };

      const playVibration = () => {
        if ("vibrate" in navigator) {
          switch (severity) {
            case "success":
              navigator.vibrate?.([100, 50, 100]);
              break;
            case "error":
              navigator.vibrate?.([200, 100, 200, 100, 200]);
              break;
            case "warning":
              navigator.vibrate?.([150, 75, 150]);
              break;
            default:
              break;
          }
        }
      };

      playSound();
      playVibration();

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
