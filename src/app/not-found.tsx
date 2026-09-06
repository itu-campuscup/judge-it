import { Container, Typography, Box, Button } from "@mui/material";
import Link from "next/link";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: 4,
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 80,
            color: "error.main",
            mb: 2,
          }}
        />
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Link href="/" passHref>
          <Button variant="contained" size="large" sx={{ mt: 2 }}>
            Go Home
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
