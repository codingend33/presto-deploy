import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiCall from "../api";
import { Box, TextField, Button } from "@mui/material";
import { useErrorPopup } from "../components/ErrorPopup";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const showError = useErrorPopup();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError("Passwords do not match", "error");
      return;
    }
    try {
      const response = await apiCall("/admin/auth/register", "POST", {
        email,
        password,
        name,
      });
      if (response.error) {
        showError(response.error, "error");
      }
      const { token } = response;
      if (token) {
        localStorage.setItem("token", token);
        navigate("/dashboard");
      }
    } catch (error) {
      showError(error.message || "Registration failed", "error");
    }
  };

  return (
    <form onSubmit={handleRegister}>
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
            gap: "5px",
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
            id="name"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <TextField
            required
            id="confirm-password"
            label="Confirm Password"
            type="password"
            variant="filled"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Box>

        <Button variant="contained" type="submit" sx={{ mt: 2 }}>
          Register
        </Button>
      </Box>
    </form>
  );
};

export default RegisterForm;
