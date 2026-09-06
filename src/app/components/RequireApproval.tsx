"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useAuth } from "@/AuthContext";

/**
 * Component to check if user is approved before allowing access
 * Shows pending approval message if user is authenticated but not approved
 */
export function RequireApproval({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const userStatus = useQuery(api.admin.getCurrentUserStatus);
  const router = useRouter();

  // If not authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Loading state
  if (userStatus === undefined) {
    return (
      <Container>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null;
  }

  // Not approved - show pending message
  if (!userStatus.approved) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
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
              be approved by an administrator before you can access this page.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while an administrator reviews your request. You will
              be able to access the application once approved.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.disabled">
                Current status: Waiting for admin approval
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Approved - render children
  return <>{children}</>;
}
