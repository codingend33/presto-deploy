import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiCall from "../api";
import { TextField, Button, Box, Modal, Typography } from "@mui/material";
import PresentationCard from "../components/PresentationCard";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import { useErrorPopup } from "../components/ErrorPopup";

const Dashboard = () => {
  const [presentations, setPresentations] = useState({});
  const [displayModal, setDisplayModal] = useState(false);
  const [newPresentationName, setNewPresentationName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newThumbnail, setNewThumbnail] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const showError = useErrorPopup();

  useEffect(() => {
    const getPresentations = async () => {
      try {
        const response = await apiCall("/store", "GET", {}, token);

        if (response && response.store) {
          if (Object.keys(response.store).length > 0) {
            const updatedPresentations = Object.keys(response.store).reduce(
              (acc, key) => {
                const pres = response.store[key];
                const thumbnail =
                  pres.thumbnail ||
                  (pres.slides && pres.slides.length > 0
                    ? pres.slides[0].content
                    : "");
                acc[key] = { ...pres, thumbnail };
                return acc;
              },
              {}
            );
            setPresentations(updatedPresentations);
          } else {
            setPresentations({});
          }
        } else {
          setPresentations({});
        }
      } catch (error) {
        showError("Failed to get presentations: " + error.message, "error");
      }
    };
    getPresentations();
  }, [token]);

  const modalOpen = () => setDisplayModal(true);
  const modalClose = () => {
    setNewPresentationName("");
    setNewDescription("");
    setNewThumbnail("");
    setDisplayModal(false);
  };

  const createPresentation = async () => {
    const currentTime = new Date().toISOString();
    const newPresentationId = `presentation_${Date.now()}`;
    const newPresentation = {
      title: newPresentationName,
      description: newDescription,
      thumbnail: newThumbnail,
      slides: [{ slide_id: `slide_${Date.now()}`, content: "", position: 1 }],
      createdAt: currentTime,
    };

    const existingStore = presentations || {};
    const updatedStore = {
      ...existingStore,
      [newPresentationId]: newPresentation,
    };

    const updatedData = {
      store: updatedStore,
    };

    try {
      await apiCall("/store", "PUT", updatedData, token);
      setPresentations(updatedStore);
      modalClose();
    } catch (error) {
      showError("Failed to create presentation: " + error.message, "error");
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography
        variant="h1"
        sx={{
          borderLeft: 4,
          borderColor: "primary.main",
          paddingLeft: 2,
          fontSize: "3em",
          mt: 2,
          mb: 3,
        }}
      >
        Dashboard
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          maxWidth: "1130px",
        }}
      >
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => navigate("/logout")}
        >
          Logout
        </Button>
        <Button
          id="new-presentation-button"
          variant="contained"
          onClick={modalOpen}
          sx={{ textTransform: "none" }}
          startIcon={<AddIcon />}
        >
          New Presentation
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mt: 3,
        }}
      >
        {presentations &&
          Object.keys(presentations).map((key) => (
            <PresentationCard
              key={key}
              presentation={presentations[key]}
              presentationId={key}
            />
          ))}
      </Box>

      <Modal open={displayModal} onClose={modalClose}>
        <Box sx={{ ...modalStyle }}>
          <h2>Create New Presentation</h2>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              id="presentation-title-input"
              label="Presentation Name"
              variant="filled"
              value={newPresentationName}
              onChange={(e) => setNewPresentationName(e.target.value)}
            />
            <TextField
              label="Description"
              variant="filled"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <TextField
              label="Thumbnail URL"
              variant="filled"
              value={newThumbnail}
              onChange={(e) => setNewThumbnail(e.target.value)}
            />
            <Button
              id="presentation-submit-button"
              variant="contained"
              onClick={createPresentation}
              sx={{ textTransform: "none" }}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 50,
  p: 5,
};

export default Dashboard;
