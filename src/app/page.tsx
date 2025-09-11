"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/AuthContext";
import {
  Button,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import Header from "./components/Header";
import AlertComponent from "./components/AlertComponent";

type AlertSeverity = "success" | "error" | "warning" | "info";

function Home() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>("error");
  const [alertText, setAlertText] = useState<string>("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      const err = "Error logging in: " + error.message;
      setAlertOpen(true);
      setAlertSeverity("error");
      setAlertText(err);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h5">Loading...</Typography>
      </Container>
    );
  }

  if (user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #224186 0%, #1a3670 100%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header user={user} />
        <Container
          maxWidth="md"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Card
            elevation={8}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 3,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              width: "100%",
            }}
          >
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: "bold",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                background: "#224186",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🏆 Welcome, {user.email?.split("@")[0] || 'User'}!
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                color: "text.secondary",
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
              }}
            >
              Ready to judge? 🎯
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 3,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Link
                href="/stats"
                style={{ textDecoration: "none", width: "100%" }}
              >
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: { xs: "1.1rem", sm: "1.2rem" },
                    fontWeight: "bold",
                    background: "#224186",
                    borderRadius: 2,
                    textTransform: "none",
                    minHeight: "60px",
                    "&:hover": {
                      background: "#1a3670",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  📊 View Stats
                </Button>
              </Link>
              <Link
                href="/judge-it"
                style={{ textDecoration: "none", width: "100%" }}
              >
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: { xs: "1.1rem", sm: "1.2rem" },
                    fontWeight: "bold",
                    background: "linear-gradient(45deg, #f093fb, #f5576c)",
                    borderRadius: 2,
                    textTransform: "none",
                    minHeight: "60px",
                    "&:hover": {
                      background: "linear-gradient(45deg, #e084eb, #f04658)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  ⚖️ Start Judging
                </Button>
              </Link>
            </Box>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #224186 0%, #1a3670 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <AlertComponent
        open={alertOpen}
        severity={alertSeverity}
        text={alertText}
        setOpen={setAlertOpen}
      />
      <Container maxWidth="sm">
        <Card
          elevation={12}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(15px)",
          }}
        >
          <Box
            sx={{
              background: "#224186",
              p: 4,
              textAlign: "center",
              color: "white",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                mb: 1,
                fontSize: { xs: "2rem", sm: "2.5rem" },
              }}
            >
              Judge-IT
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                Sign in to start judging competitions
              </Typography>
            </Box>

            <form onSubmit={handleLogin}>
              <TextField
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.1)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#224186",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#224186",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    "&.Mui-focused": {
                      color: "#224186",
                    },
                  },
                }}
              />
              <TextField
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.1)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#224186",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#224186",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    "&.Mui-focused": {
                      color: "#224186",
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                  fontWeight: "bold",
                  background: "#224186",
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    background: "#1a3670",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Judge-IT{" "}
            <Link
              href="https://github.com/itu-campuscup/judge-it"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Typography
                component="span"
                sx={{
                  color: "white",
                  textDecoration: "underline",
                  ml: 0.5,
                }}
              >
                GitHub Repository
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
