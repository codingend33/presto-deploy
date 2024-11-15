import React, { useState, useEffect } from "react";
import apiCall from "../api";
import {
  Modal,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";

const BackgroundSettings = ({
  open,
  onClose,
  presentation,
  setPresentation,
  currentSlideIndex,
  presentationId,
}) => {
  const [backgroundType, setBackgroundType] = useState("solid");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundGradient, setBackgroundGradient] =
    useState("#ffffff,#000000");
  const [backgroundImage, setBackgroundImage] = useState("");

  const handleBackgroundTypeChange = (e) => {
    setBackgroundType(e.target.value);
  };

  const applyBackground = async () => {
    const updatedSlides = [...presentation.slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    if (backgroundType === "solid") {
      currentSlide.background = { type: "solid", color: backgroundColor };
    } else if (backgroundType === "gradient") {
      const colors = backgroundGradient.split(",");
      currentSlide.background = { type: "gradient", colors };
    } else if (backgroundType === "image") {
      currentSlide.background = { type: "image", url: backgroundImage };
    }

    const updatedPresentation = { ...presentation, slides: updatedSlides };
    setPresentation(updatedPresentation);

    try {
      await apiCall("/store", "PUT", {
        store: { [presentationId]: updatedPresentation },
      });
    } catch (error) {
      console.error("Failed to update background:", error);
    }

    onClose();
  };

  useEffect(() => {
    if (presentation) {
      const slide = presentation.slides[currentSlideIndex];
      if (slide && slide.background) {
        setBackgroundType(slide.background.type);
        if (slide.background.type === "solid") {
          setBackgroundColor(slide.background.color);
        } else if (slide.background.type === "gradient") {
          setBackgroundGradient(slide.background.colors.join(","));
        } else if (slide.background.type === "image") {
          setBackgroundImage(slide.background.url);
        }
      }
    }
  }, [presentation, currentSlideIndex]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...modalStyle }}>
        <h2>Choose Background</h2>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Background Type</InputLabel>
          <Select value={backgroundType} onChange={handleBackgroundTypeChange}>
            <MenuItem value="solid">Solid Color</MenuItem>
            <MenuItem value="gradient">Gradient</MenuItem>
            <MenuItem value="image">Image</MenuItem>
          </Select>
        </FormControl>

        {backgroundType === "solid" && (
          <TextField
            label="Background Color"
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        )}

        {backgroundType === "gradient" && (
          <TextField
            label="Gradient Colors (comma-separated)"
            value={backgroundGradient}
            onChange={(e) => setBackgroundGradient(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        )}

        {backgroundType === "image" && (
          <TextField
            label="Image URL"
            value={backgroundImage}
            onChange={(e) => setBackgroundImage(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        )}

        <Button
          variant="contained"
          onClick={applyBackground}
          sx={{ mt: 2 }}
          fullWidth
        >
          Apply
        </Button>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80vw",
  maxWidth: "400px",
  maxHeight: "80vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: { xs: 2, md: 4 },
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 1,

  "@media (max-width: 400px)": {
    width: "80vw",
    maxHeight: "60vh",
    p: 1,
  },
};

export default BackgroundSettings;
