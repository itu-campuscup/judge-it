import { useEffect, useRef } from "react";
import { Alert, Snackbar } from "@mui/material";
import { createLogger, AppError } from "@/observability";
import { useAuth } from "@/AuthContext";
import type { AlertContext, AlertSeverity } from "@/types";

interface AlertComponentProps {
  severity: AlertSeverity;
  text: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  // Optional context for better error tracking
  context?: AlertContext;
}

const AlertComponent: React.FC<AlertComponentProps> = ({
  severity,
  text,
  open,
  setOpen,
  context,
}) => {
  const { user } = useAuth();
  const audioRef = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const loggerRef = useRef(createLogger("AlertComponent", user));

  // Update logger when user changes
  useEffect(() => {
    loggerRef.current.setUser(user);
  }, [user]);

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
      console.debug(
        `Audio initialization failed - audio will be disabled. Error: ${error}`,
      );
    }
  }, []);

  // Store context in ref to avoid re-running effect when context object reference changes
  const contextRef = useRef(context);
  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    if (open) {
      // Use contextRef.current to get latest context without it being a dependency
      const ctx = contextRef.current;

      // Log errors and warnings automatically
      if (severity === "error" || severity === "warning") {
        const operation = ctx?.operation || "user_alert";
        const location = ctx?.location || "AlertComponent";

        const error = ctx?.error
          ? ctx.error
          : new AppError(
              text,
              severity === "error" ? "USER_ERROR" : "USER_WARNING",
              ctx?.metadata || {},
              undefined,
              location,
            );

        if (severity === "error") {
          loggerRef.current.error(operation, error, {
            alertText: text,
            userVisible: true,
            ...ctx?.metadata,
          });
        } else {
          loggerRef.current.warn(operation, {
            message: text,
            userVisible: true,
            ...ctx?.metadata,
          });
        }
      } else if (severity === "success" && ctx?.operation) {
        // Optionally log successful operations if context provided
        loggerRef.current.info(ctx.operation, {
          message: text,
          userVisible: true,
          ...ctx?.metadata,
        });
      }

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
              console.debug(
                `Audio play blocked - this is expected behavior. Error: ${playError}`,
              );
            }
          }
        } catch (error) {
          // Silently ignore any other audio-related errors
          console.debug(`Audio error handled gracefully. Error: ${error}`);
        }
      };

      const playVibration = () => {
        try {
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
        } catch (vibrationError) {
          console.error(`Vibration error. Error: ${vibrationError}`);
        }
      };

      playSound();
      playVibration();

      const timer = setTimeout(() => {
        setOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, severity, text, setOpen]);

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
