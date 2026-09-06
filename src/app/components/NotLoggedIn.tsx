import React from "react";
import { Container, Typography, Button } from "@mui/material";
import Link from "next/link";

const NotLoggedIn: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4">
        You need to be logged in to view this page.
      </Typography>
      <Link href="/" passHref>
        <Button variant="contained" color="primary">
          Go to Home
        </Button>
      </Link>
    </Container>
  );
};

export default NotLoggedIn;
