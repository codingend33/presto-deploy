import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Typography, Box } from "@mui/material";

const Home = () => {
  return (
    <Box
      sx={{
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

      <Box sx={{ display: "flex", justifyContent: "center" }}>
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
      </Box>
    </Box>
  );
};

export default Home;
