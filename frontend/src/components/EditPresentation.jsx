import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiCall from "../api";
import {
  TextField,
  Button,
  Box,
  Modal,
  IconButton,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";

import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import DraftsIcon from "@mui/icons-material/Drafts";
import SendIcon from "@mui/icons-material/Send";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StarBorder from "@mui/icons-material/StarBorder";

const EditPresentation = () => {
  const params = useParams();
  let presentationId = params.id;
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [customThumbnailURL, setCustomThumbnailURL] = useState("");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [deletePopup, setDeletePopup] = useState(false);
  const [showTitleEditModal, setShowTitleEditModal] = useState(false);

  const [elements, setElements] = useState([]); // store all elements of one slide
  const [elementModalDisplay, setElementModalDisplay] = useState(false); // manage element modal
  const [handlingElement, setHandlingElement] = useState(null); // manage currently editing element

  const [backgroundModalDisplay, setBackgroundModalDisplay] = useState(false); //background modal
  const [backgroundType, setBackgroundType] = useState("solid"); // background type
  const [backgroundColor, setBackgroundColor] = useState("#ffffff"); // bgc
  const [backgroundGradient, setBackgroundGradient] =
    useState("#ffffff,#000000"); // gradient
  const [backgroundImage, setBackgroundImage] = useState(""); // img

  const [open, setOpen] = React.useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const getPresentation = async () => {
      try {
        const response = await apiCall("/store", "GET", {}, token);
        console.log("edit界面 response:", response);
        const userStore = response.store;
        if (userStore && userStore[presentationId]) {
          const currentPres = userStore[presentationId];
          setPresentation(currentPres);
          setTitle(currentPres.title || "");
          setThumbnail(
            currentPres.thumbnail ||
              (currentPres.slides && currentPres.slides.length > 0
                ? currentPres.slides[0].content
                : "")
          );
          setElements(currentPres.slides[currentSlideIndex]?.elements || []);
        } else {
          console.error("Presentation not found");
        }
      } catch (error) {
        console.error("Failed to get presentation:", error.message);
      }
    };
    getPresentation();
  }, [presentationId, token, currentSlideIndex]);

  const handleClick = () => {
    setOpen(!open);
  };

  // open element modal
  const openNewElementModal = (type) => {
    const maxLayer = elements.reduce(
      (max, element) => Math.max(max, element.layer || 0),
      0
    );
    setHandlingElement({
      type,
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      autoPlay: false,
      layer: maxLayer + 1,
    }); //initial element setting
    setElementModalDisplay(true);
  };

  // handle element change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHandlingElement((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    })); // store currently edited element
  };

  // save new and updated element
  const saveElement = () => {
    let updatedElement = { ...handlingElement };

    if (updatedElement.type === "video") {
      updatedElement.url = formatUrl(updatedElement.url);
      console.log(updatedElement.url);
    }
    // if current element is exist, find it in elements list and update it.
    // else:add new element into list.
    const updatedElements = handlingElement.id
      ? elements.map((element) =>
          element.id === updatedElement.id ? updatedElement : element
        )
      : [...elements, { ...updatedElement, id: `element_${Date.now()}` }];

    console.log("updatedElements", updatedElements);

    setElements(updatedElements); // update elements in slide
    updateDatabase(updatedElements); // update database

    setElementModalDisplay(false);
  };

  // delete element
  const deleteElement = async (elementId) => {
    const updatedElements = elements.filter(
      (element) => element.id !== elementId
    );

    setElements(updatedElements); // update elements in slide
    updateDatabase(updatedElements); // update database
  };

  // update database
  const updateDatabase = async (newElements) => {
    const updatedPresentation = {
      ...presentation,
      slides: presentation.slides.map((slide, index) =>
        index === currentSlideIndex
          ? { ...slide, elements: newElements }
          : slide
      ),
    };

    setPresentation(updatedPresentation); // update elements in presentation

    try {
      const response = await apiCall("/store", "GET", {}, token);
      const updatedStore = {
        ...response.store,
        [presentationId]: updatedPresentation,
      };
      await apiCall("/store", "PUT", { store: updatedStore }, token);
      setPresentation(updatedPresentation);
    } catch (error) {
      console.error("Failed to save presentation to database:", error.message);
    }
  };

  const formatUrl = (url) => {
    const videoIdMatch = url.split("v=")[1]?.split("&")[0];
    const videoId = videoIdMatch ? videoIdMatch : "";
    console.log(videoId);
    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    } else {
      console.error("Invalid YouTube URL");
      return url;
    }
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const handleBackgroundTypeChange = (e) => {
    setBackgroundType(e.target.value); //
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
    setPresentation({ ...presentation, slides: updatedSlides });
    setBackgroundModalDisplay(false);

    try {
      await apiCall(
        "/store",
        "PUT",
        { store: { [presentationId]: updatedPresentation } },
        token
      );
    } catch (error) {
      console.error("Failed to update background in database:", error.message);
    }
  };

  const renderBackground = () => {
    const slide = presentation.slides[currentSlideIndex];
    if (!slide.background) return { backgroundColor: "#ffffff" };

    if (slide.background.type === "solid") {
      return { backgroundColor: slide.background.color };
    }
    if (slide.background.type === "gradient") {
      return {
        background: `linear-gradient(to right, ${slide.background.colors.join(
          ", "
        )})`,
      };
    }
    if (slide.background.type === "image") {
      return {
        backgroundImage: `url(${slide.background.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
  };
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // Delete Presentation
  const deletePresentation = async () => {
    try {
      const response = await apiCall("/store", "GET", {}, token);
      const getStore = { ...response.store };
      delete getStore[presentationId];
      await apiCall("/store", "PUT", { store: getStore }, token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to delete presentation:", error.message);
    }
  };

  const saveTitleAndThumbnail = async () => {
    try {
      const updatedPresentation = {
        ...presentation,
        title: title,
        thumbnail: customThumbnailURL || thumbnail,
      };
      const response = await apiCall("/store", "GET", {}, token);
      const updatedStore = {
        ...response.store,
        [presentationId]: updatedPresentation,
      };
      await apiCall("/store", "PUT", { store: updatedStore }, token);
      setPresentation(updatedPresentation);
      setShowTitleEditModal(false);
    } catch (error) {
      console.error("Failed to update title:", error.message);
    }
  };

  // Navigate Slides
  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  // Add New Slide
  const addNewSlide = async () => {
    const newSlide = {
      slide_id: `slide_${Date.now()}`,
      content: "",
      position: presentation.slides.length + 1,
    };

    const updatedSlides = [...presentation.slides, newSlide].map(
      (slide, index) => ({
        ...slide,
        position: index + 1,
      })
    );

    const updatedPresentation = {
      ...presentation,
      slides: updatedSlides,
    };

    try {
      const response = await apiCall("/store", "GET", {}, token);
      const updatedStore = {
        ...response.store,
        [presentationId]: updatedPresentation,
      };
      await apiCall("/store", "PUT", { store: updatedStore }, token);
      setPresentation(updatedPresentation);
      setCurrentSlideIndex(updatedPresentation.slides.length - 1);
    } catch (error) {
      console.error("Failed to add slide:", error.message);
    }
  };

  // Delete Slide
  const deleteSlide = async () => {
    if (presentation.slides.length === 1) {
      alert("Cannot delete the only slide. Delete the presentation instead.");
      return;
    }

    const updatedSlides = presentation.slides.filter(
      (slide, index) => index !== currentSlideIndex
    );
    const sortedSlides = updatedSlides.map((slide, index) => ({
      ...slide,
      position: index + 1,
    }));

    const updatedPresentation = {
      ...presentation,
      slides: sortedSlides,
    };

    try {
      const response = await apiCall("/store", "GET", {}, token);
      const updatedStore = {
        ...response.store,
        [presentationId]: updatedPresentation,
      };
      await apiCall("/store", "PUT", { store: updatedStore }, token);
      setPresentation(updatedPresentation);
      setCurrentSlideIndex(Math.max(currentSlideIndex - 1, 0));
    } catch (error) {
      console.error("Failed to delete slide:", error.message);
    }
  };

  if (!presentation) {
    return <div>No presentation...</div>;
  }

  const openPreview = () => {
    window.open(`/preview/${presentationId}`, "_blank");
  };

  return (
    <Box
      sx={{
        padding: "20px",
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") goToPreviousSlide();
        if (e.key === "ArrowRight") goToNextSlide();
      }}
    >
      <Box display="flex" gap="10px">
        <Button
          variant="outlined"
          color="error"
          onClick={() => navigate("/logout")}
        >
          Logout
        </Button>
        <Button variant="outlined" onClick={() => navigate("/dashboard")}>
          Back
        </Button>
      </Box>

      <h1>{presentation.title}</h1>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ width: "250px", bgcolor: "background.paper" }}>
          <List
            sx={{ width: "100%", maxWidth: 250, bgcolor: "background.paper" }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
                Tools list
              </ListSubheader>
            }
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button variant="text" onClick={() => setDeletePopup(true)}>
                Delete Presentation
              </Button>
              <Button
                variant="text"
                color="primary"
                onClick={() => setShowTitleEditModal(true)}
              >
                Edit Title & Thumbnail
              </Button>
              <Button
                variant="text"
                onClick={() => setBackgroundModalDisplay(true)}
              >
                Change Background
              </Button>
            </Box>

            <ListItemButton onClick={handleClick}>
              <ListItemText primary="Add elements" />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* add elements  */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <Button
                    variant="text"
                    onClick={() => openNewElementModal("text")}
                  >
                    Add Text
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => openNewElementModal("image")}
                  >
                    Add Image
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => openNewElementModal("video")}
                  >
                    Add Video
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => openNewElementModal("code")}
                  >
                    Add Code
                  </Button>
                </Box>
              </List>
            </Collapse>

            <ListItemButton>
              <ListItemText primary="Sent mail" />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Drafts" />
            </ListItemButton>
          </List>

          <Button onClick={openPreview} variant="contained" sx={{ mt: 2 }}>
            Preview
          </Button>
        </Box>
      </Box>

      {/* edit elements modal */}
      <Modal
        open={elementModalDisplay}
        onClose={() => setElementModalDisplay(false)}
      >
        <Box sx={{ ...modalStyle }}>
          <h2>Edit {handlingElement?.type} Properties</h2>

          {/* x and y */}
          <TextField
            label="X Position (%)"
            name="x"
            value={handlingElement?.x || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Y Position (%)"
            name="y"
            value={handlingElement?.y || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Layer (z-index)"
            name="layer"
            type="number"
            value={handlingElement?.layer || 1}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
            helperText="Higher layer values will appear on top"
          />

          {/* different type*/}

          {/* text */}
          {handlingElement?.type === "text" && (
            <>
              <TextField
                label="Text"
                name="text"
                value={handlingElement.text || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Font Size (em)"
                name="fontSize"
                value={handlingElement.fontSize || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Color (HEX)"
                name="color"
                value={handlingElement.color || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Width (%)"
                name="width"
                value={handlingElement.width || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Height (%)"
                name="height"
                value={handlingElement.height || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={handlingElement.fontFamily || ""}
                  onChange={handleChange}
                  name="fontFamily"
                >
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {/* image */}
          {handlingElement?.type === "image" && (
            <>
              <TextField
                label="Image URL"
                name="url"
                value={handlingElement.url || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Alt Text"
                name="alt"
                value={handlingElement.alt || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Width (%)"
                name="width"
                value={handlingElement.width || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Height (%)"
                name="height"
                value={handlingElement.height || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
            </>
          )}
          {/* video */}
          {handlingElement?.type === "video" && (
            <>
              <TextField
                label="Video URL"
                name="url"
                value={handlingElement.url || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Width (%)"
                name="width"
                value={handlingElement.width || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Height (%)"
                name="height"
                value={handlingElement.height || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <label>
                <input
                  type="checkbox"
                  name="autoPlay"
                  checked={handlingElement.autoPlay || false}
                  onChange={handleChange}
                />
                AutoPlay
              </label>
            </>
          )}
          {/* code */}
          {handlingElement?.type === "code" && (
            <>
              <TextField
                label="Code"
                name="code"
                value={handlingElement.code || ""}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                sx={{ mt: 2 }}
              />
              <TextField
                label="Font Size (em)"
                name="fontSize"
                value={handlingElement.fontSize || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Width (%)"
                name="width"
                value={handlingElement.width || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Height (%)"
                name="height"
                value={handlingElement.height || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
            </>
          )}

          {/* save button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={saveElement} variant="contained">
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* bgc modal*/}
      <Modal
        open={backgroundModalDisplay}
        onClose={() => setBackgroundModalDisplay(false)}
      >
        <Box sx={{ ...modalStyle }}>
          <h2>Choose Background</h2>

          {/* select */}
          <FormControl fullWidth>
            <InputLabel>Background Type</InputLabel>
            <Select
              value={backgroundType}
              onChange={handleBackgroundTypeChange}
              name="backgroundType"
            >
              <MenuItem value="solid">Solid Color</MenuItem>
              <MenuItem value="gradient">Gradient</MenuItem>
              <MenuItem value="image">Image</MenuItem>
            </Select>
          </FormControl>

          {/* different type with different input */}
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
              placeholder="#ffffff,#000000"
              value={backgroundGradient}
              onChange={(e) => setBackgroundGradient(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
          )}

          {backgroundType === "image" && (
            <TextField
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
          )}

          {/* apply backgroundType */}
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

      {/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

      <Box sx={{ display: "flex", alignItems: "center", marginTop: "20px" }}>
        <IconButton
          onClick={goToPreviousSlide}
          disabled={currentSlideIndex === 0}
        >
          <ArrowBackIcon />
        </IconButton>
        <span>
          Slide {currentSlideIndex + 1} of {presentation.slides.length}
        </span>
        <IconButton
          onClick={goToNextSlide}
          disabled={currentSlideIndex === presentation.slides.length - 1}
        >
          <ArrowForwardIcon />
        </IconButton>
        <Button onClick={addNewSlide}>Add Slide</Button>
        <Button onClick={deleteSlide}>Delete Slide</Button>
      </Box>

      <Modal open={deletePopup} onClose={() => setDeletePopup(false)}>
        <Box sx={{ ...modalStyle }}>
          <h2>Are you sure?</h2>
          <Button onClick={deletePresentation}>Yes</Button>
          <Button onClick={() => setDeletePopup(false)}>No</Button>
        </Box>
      </Modal>

      <Modal
        open={showTitleEditModal}
        onClose={() => setShowTitleEditModal(false)}
      >
        <Box sx={{ ...modalStyle }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Custom Thumbnail URL"
            value={customThumbnailURL}
            onChange={(e) => setCustomThumbnailURL(e.target.value)}
            fullWidth
          />
          <Button onClick={saveTitleAndThumbnail}>Save</Button>
        </Box>
      </Modal>
    </Box>
  );
};

const slideBox = {
  position: "relative",
  maxWidth: "1000px",
  height: "400px",
  border: "1px solid #ddd",
  marginTop: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const slideNumberBox = {
  position: "absolute",
  bottom: "10px",
  left: "10px",
  width: "50px",
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1em",
  color: "black",
  border: "1px solid black",
  borderRadius: "5px",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
};
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default EditPresentation;
