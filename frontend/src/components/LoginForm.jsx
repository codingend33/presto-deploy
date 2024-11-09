import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiCall from "../api";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiCall("/admin/auth/login", "POST", {
        email,
        password,
      });
      const { token } = response;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("email", email);
        console.log("User logged in:", response);
        navigate("/dashboard");
      } else {
        setError("Login failed: No token received");
      }
    } catch (error) {
      setError("Login failed");
      console.error("Login error:", error.message);
    }
  };

  return (
    // pressing enter key to login
    <form onSubmit={handleLogin}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            "& > :not(style)": { m: 1, width: "30ch" },
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            required
            id="email"
            type="email"
            label="Email"
            variant="filled"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            required
            id="password"
            label="Password"
            type="password"
            variant="filled"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>
        <Button variant="contained" type="submit">
          Login
        </Button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </form>
  );
};

export default LoginForm;
