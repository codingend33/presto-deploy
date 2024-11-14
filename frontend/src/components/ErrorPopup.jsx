import { createContext, useState, useContext } from "react";
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
    // Provide the showError function to any component within this context
    <ErrorContext.Provider value={showError}>
      {children}
      <Snackbar
        open={errorBar.open}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {/* Alert component to display the error message with severity styling */}
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

// Custom hook to access the showError function in any component
export const useErrorPopup = () => useContext(ErrorContext);
