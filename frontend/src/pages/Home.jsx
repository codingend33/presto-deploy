import React from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

const Home = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <h1>Welcome to Presto</h1>
      <p style={{ marginTop: 0 }}>Your lightweight slides tool.</p>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Stack spacing={2} direction="row">
          <Link to="/login">
            <Button variant="contained">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="contained" color="success">
              Register
            </Button>
          </Link>
        </Stack>
      </div>
    </div>
  );
};

export default Home;
