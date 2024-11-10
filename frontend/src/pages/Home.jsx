import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";

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
      <Typography
        variant="h1"
        sx={{
          fontSize: "4em",
          "&:hover": {
            color: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        Welcome to Presto
      </Typography>
      <Typography
        sx={{
          fontSize: "1.5em",
          "&:hover": {
            color: "rgba(0, 0, 0, 0.5)",
          },
          mt: 2,
          mb: 2,
        }}
      >
        Your lightweight slides tool
      </Typography>

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
