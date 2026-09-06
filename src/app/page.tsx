"use client";

import Link from "next/link";
import { useAuth } from "@/AuthContext";
import { Button, Box, Typography, Card, Container, Paper } from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import Header from "./components/Header";
import { SignInForm } from "./components/SignInForm";

function Home() {
  const { isAuthenticated, user, loading, isApproved } = useAuth();

  if (loading) {
    return (
      <Container>
        <Typography variant="h5">Loading...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <SignInForm />;
  }

  if (!isApproved) {
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
          maxWidth="sm"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <HourglassEmptyIcon
              sx={{
                fontSize: 64,
                color: "primary.main",
                mb: 2,
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Pending Approval
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your account has been created successfully! However, you need to
              be approved by an administrator before you can access the
              application.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while an administrator reviews your request. You will
              be able to access the application once approved.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.disabled">
                Email: {user?.email}
              </Typography>
            </Box>
          </Paper>
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
            🏆 Welcome, {user?.email?.split("@")[0] || "User"}!
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

export default Home;
