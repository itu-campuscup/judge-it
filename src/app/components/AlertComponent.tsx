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
    try {
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
          if (audio) {
            audio
              .play()
              .then(() => {
                audio.pause();
                audio.currentTime = 0;
              })
              .catch(() => {
                // Silently ignore - user interaction will enable audio when needed
              });
          }
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
    } catch (error) {
      console.debug("Audio initialization failed - audio will be disabled");
    }
  }, []);

  useEffect(() => {
    if (open) {
      const playSound = async () => {
        try {
          let audio: HTMLAudioElement | null;
          switch (severity) {
            case "success":
              audio = audioRef.current["success"];
              break;
            case "error":
            case "warning":
              audio = audioRef.current["error"];
              break;
            default:
              return;
          }

          if (audio) {
            // Reset audio to beginning
            audio.currentTime = 0;

            // Try to play audio, but catch and ignore permission errors
            try {
              await audio.play();
            } catch (playError) {
              // Silently ignore audio play errors (user hasn't interacted, autoplay blocked, etc.)
              console.debug("Audio play blocked - this is expected behavior");
            }
          }
        } catch (error) {
          // Silently ignore any other audio-related errors
          console.debug("Audio error handled gracefully:", error);
        }
      };

      const playVibration = () => {
        if ("vibrate" in navigator) {
          try {
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
          } catch (vibrationError) {
            // Silently ignore vibration errors
            console.debug("Vibration not supported or blocked");
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
