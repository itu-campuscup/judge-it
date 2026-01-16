"use client";

import Link from "next/link";
import { useAuth } from "@/AuthContext";
import { Button, Box, Typography, Card, Container } from "@mui/material";
import Header from "./components/Header";

function Home() {
  const { user, loading } = useAuth();

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
        <Header />
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
              🏆 Welcome, {user.email?.split("@")[0] || "User"}!
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
        flexDirection: "column",
      }}
    >
      <Header />
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
            🏆 Judge-IT
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              color: "text.secondary",
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
            }}
          >
            Real-time competition judging and statistics
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: "text.secondary",
            }}
          >
            Sign in with Clerk to access the judging interface and view
            competition stats.
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}

export default Home;
