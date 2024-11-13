import { createContext, useState, useContext } from "react";
import { Snackbar, Alert } from "@mui/material";

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [errorBar, setErrorBar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

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
        autoHideDuration={6000}
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

export const useErrorPopup = () => useContext(ErrorContext);
