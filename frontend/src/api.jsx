const baseURL = "http://localhost:5005";
import { Box, TextField, Button, Typography } from "@mui/material";

const apiCall = async (path, method, data = {}, token = "") => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method: method,
    headers: headers,
  };

  if (method !== "GET" && method !== "HEAD") {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${baseURL}${path}`, options);

    const data = await response.json();

    if (!response.ok) {
      console.error(`Status: ${response.status}\nError: ${data.error}`);
      return { error: data.error || `Error ${response.status}` };
    }
    return data;
  } catch (error) {
    console.error(`Fetch error:${error.message}`);
    return { error: `Fetch error: ${error.message}` };
  }
};

export default apiCall;
