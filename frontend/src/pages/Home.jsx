import React from "react";
import { Link } from "react-router-dom";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const Home = () => {
  return (
    <div>
      <h1>Welcome to Presto</h1>
      <p>You lightweight slides tool.</p>
      <div>
        <Stack spacing={2} direction="row">
        <Link to="/login"><Button variant="contained" >Login</Button></Link>
        <Link to="/register"><Button variant="contained" color="success">Register</Button></Link>
        </Stack>
      </div>
    </div>
  );
};

export default Home;
