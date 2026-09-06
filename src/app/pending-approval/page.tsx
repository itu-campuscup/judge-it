import { Box, Container, Typography, Paper } from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

export default function PendingApprovalPage() {
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
            Your account has been created successfully! However, you need to be
            approved by an administrator before you can access the application.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while an administrator reviews your request. You will
            receive an email notification once your account has been approved.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.disabled">
              If you have any questions, please contact the administrator.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
