import { createContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

// Create a context for error handling
const ErrorContext = createContext();

// ErrorProvider component that provides error handling to its children
export const ErrorProvider = ({ children }) => {
  const [errorBar, setErrorBar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Function to show the error snackbar with a specified message and severity
  const showError = (message, severity = "info") => {
    setErrorBar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setErrorBar({ ...errorBar, open: false });
  };

  return (
    <ErrorContext.Provider value={showError}>
      {children}
      <Snackbar
        open={errorBar.open}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={errorBar.severity}
          sx={{ width: "100%" }}
        >
          {errorBar.message}
        </Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
};

export default ErrorContext;
