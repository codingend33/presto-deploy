import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiCall from "../api";
import { TextField, Button, Box, Modal } from "@mui/material";
import PresentationCard from "../components/PresentationCard";

const Dashboard = () => {
  const [presentations, setPresentations] = useState({});
  const [displayModal, setDisplayModal] = useState(false);
  const [newPresentationName, setNewPresentationName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newThumbnail, setNewThumbnail] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const getPresentations = async () => {
      try {
        const response = await apiCall("/store", "GET", {}, token);
        if (response && response.store) {
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
          setError("No store available");
          setPresentations({});
        }
      } catch (error) {
        setError("Failed to get presentations:", error.message);
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
      setError("Failed to create presentation:", error.message);
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "20px",
          justifyContent: "space-between",
          maxWidth: "1120px",
        }}
      >
        <Button
          variant="outlined"
          color="error"
          onClick={() => navigate("/logout")}
        >
          Logout
        </Button>
        <Button
          variant="contained"
          onClick={modalOpen}
          sx={{ textTransform: "none" }}
        >
          New Presentation
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "20px",
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
      </div>

      <Modal open={displayModal} onClose={modalClose}>
        <Box sx={{ ...modalStyle }}>
          <h2>Create New Presentation</h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <TextField
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
              variant="contained"
              onClick={createPresentation}
              sx={{ textTransform: "none" }}
            >
              Create
            </Button>
          </div>
        </Box>
      </Modal>
      {error && <p style={{ color: "red" }}>{error}</p>}
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
