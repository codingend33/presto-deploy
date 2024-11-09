import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiCall from "../api";
import { TextField, Button, Box } from "@mui/material";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const response = await apiCall("/admin/auth/register", "POST", {
        email,
        password,
        name,
      });
      console.log(response);
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error.message);
      setError(error.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <Box
        sx={{ "& > :not(style)": { m: 1, width: "25ch" } }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="email"
          label="Email"
          variant="filled"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="name"
          label="Name"
          variant="filled"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          variant="filled"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          id="confirm password"
          label="Confirm Password"
          type="password"
          variant="filled"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Box>

      <Button variant="contained" type="submit">
        Register
      </Button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default RegisterForm;
