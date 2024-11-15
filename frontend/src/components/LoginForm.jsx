import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiCall from "../api";
import { useErrorPopup } from "../components/ErrorPopup";

import { Box, TextField, Button } from "@mui/material";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const showError = useErrorPopup();

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
        navigate("/dashboard");
      } else {
        showError(response.error || "Unexpected error occurred", "error");
      }
    } catch (error) {
      console.error(error);
      showError(error.message || "Login failed", "error");
    }
  };

  return (
    // pressing enter key to login
    <form onSubmit={handleLogin}>
      <Box
        sx={{
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
      </Box>
    </form>
  );
};

export default LoginForm;
