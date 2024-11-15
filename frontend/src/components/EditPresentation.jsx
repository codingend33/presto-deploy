import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import CodeIcon from "@mui/icons-material/Code";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LogoutIcon from "@mui/icons-material/Logout";
import CodeHighlighter from "./CodeHighlighter";
import { useErrorPopup } from "../components/ErrorPopup";
import BackgroundSettings from "../components/BackgroundSettings";

const EditPresentation = () => {
  const params = useParams();
  let presentationId = params.id;
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [customThumbnailURL, setCustomThumbnailURL] = useState("");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(null);
  const [deletePopup, setDeletePopup] = useState(false);
  const [showTitleEditModal, setShowTitleEditModal] = useState(false);
  const [elements, setElements] = useState([]); // store all elements of one slide
  const [elementModalDisplay, setElementModalDisplay] = useState(false); // manage element modal
  const [handlingElement, setHandlingElement] = useState(null); // manage currently editing element
  const [backgroundModalDisplay, setBackgroundModalDisplay] = useState(false); //background modal
  const [open, setOpen] = React.useState(true);
  const token = localStorage.getItem("token");
  const showError = useErrorPopup();

  useEffect(() => {
    const getPresentation = async () => {
      try {
        const response = await apiCall("/store", "GET", {}, token);
        const userStore = response.store;
        if (userStore && userStore[presentationId]) {
          const currentPres = userStore[presentationId];
          setPresentation(currentPres);
          setTitle(currentPres.title || "");
          setDescription(currentPres.description || "");
          setThumbnail(currentPres.thumbnail || "");
          const urlSlideIndex = new URLSearchParams(location.search).get(
            "slide"
          );
          setCurrentSlideIndex(urlSlideIndex ? parseInt(urlSlideIndex) : 0);
          setElements(currentPres.slides[currentSlideIndex]?.elements || []);
        } else {
          showError("Presentation not found", "warning");
        }
      } catch (error) {
        showError("Failed to get presentation:" + error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    getPresentation();
  }, [presentationId, token, location.search, currentSlideIndex]);

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
    }
    // if current element is exist, find it in elements list and update it.
    // else:add new element into list.
    const updatedElements = handlingElement.id
      ? elements.map((element) =>
        element.id === updatedElement.id ? updatedElement : element
      )
      : [...elements, { ...updatedElement, id: `element_${Date.now()}` }];
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
      showError(
        "Failed to save presentation to database:" + error.message,
        "error"
      );
    }
  };
  const formatUrl = (url) => {
    const videoIdMatch = url.split("v=")[1]?.split("&")[0];
    const videoId = videoIdMatch ? videoIdMatch : "";
    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    } else {
      return url;
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

  // Delete Presentation
  const deletePresentation = async () => {
    try {
      const response = await apiCall("/store", "GET", {}, token);
      const getStore = { ...response.store };
      delete getStore[presentationId];
      await apiCall("/store", "PUT", { store: getStore }, token);
      navigate("/dashboard");
    } catch (error) {
      showError("Failed to delete presentation:" + error.message, "error");
    }
  };
  const saveTitleAndThumbnail = async () => {
    try {
      const updatedPresentation = {
        ...presentation,
        title: title,
        description: description,
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
      showError("Failed to update title:" + error.message, "error");
    }
  };

  const updateSlideIndex = (newIndex) => {
    if (newIndex >= 0 && newIndex < presentation.slides.length) {
      setCurrentSlideIndex(newIndex);
      navigate(`${location.pathname}?slide=${newIndex}`);
    }
  };
  // Navigate Slides
  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      updateSlideIndex(currentSlideIndex - 1);
    }
  };
  const goToNextSlide = () => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      updateSlideIndex(currentSlideIndex + 1);
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
      const newSlideIndex = updatedPresentation.slides.length - 1;
      setCurrentSlideIndex(newSlideIndex);
      navigate(`${location.pathname}?slide=${newSlideIndex}`);
    } catch (error) {
      showError("Failed to add slide:" + error.message, "error");
    }
  };

  // Delete Slide
  const deleteSlide = async () => {
    if (presentation.slides.length === 1) {
      showError(
        "Cannot delete the only slide. Delete the presentation instead.",
        "warning"
      );
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

      let newSlideIndex;
      if (currentSlideIndex > 0) {
        newSlideIndex = currentSlideIndex - 1;
      } else if (sortedSlides.length > 0) {
        newSlideIndex = currentSlideIndex;
      } else {
        newSlideIndex = -1;
        showError(
          "No slides available to show. You may delete the entire presentation instead.",
          "error"
        );
        return;
      }
      setCurrentSlideIndex(newSlideIndex);
      setElements(updatedPresentation.slides[newSlideIndex]?.elements || []);
      navigate(`${location.pathname}?slide=${newSlideIndex}`);
    } catch (error) {
      showError("Failed to delete slide:" + error.message, "error");
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }

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
      {/* Navigation buttons */}
      <Box display="flex" gap="10px">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/dashboard")}
        >
          Back
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => navigate("/logout")}
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </Box>
      {/* Title */}
      <Typography
        variant="h1"
        sx={{
          borderLeft: 4,
          borderColor: "primary.main",
          paddingLeft: 2,
          fontSize: "3em",
          mt: 2,
        }}
      >
        {presentation.title}
      </Typography>
      {/* Left sidebar with options */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "30px",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <Box sx={{ width: "250px", bgcolor: "background.paper" }}>
          <List
            sx={{ minWidth: 200, bgcolor: "background.paper" }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
              <ListSubheader
                component="div"
                id="nested-list-subheader"
              ></ListSubheader>
            }
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Button
                onClick={openPreview}
                variant="contained"
                sx={{ mt: 2 }}
                color="success"
                startIcon={<RemoveRedEyeIcon />}
              >
                Preview
              </Button>
              <Button
                variant="text"
                color="primary"
                onClick={() => setShowTitleEditModal(true)}
                sx={{ textTransform: "none" }}
              >
                Edit Title & Description &Thumbnail
              </Button>
              <Button
                variant="text"
                onClick={() => setBackgroundModalDisplay(true)}
                sx={{ textTransform: "none" }}
              >
                Change Background
              </Button>
            </Box>
            <Button
              variant="contained"
              onClick={handleClick}
              sx={{ width: "100%", mt: 2 }}
            >
              <ListItemText primary="Add elements" />
              {open ? <ExpandLess /> : <ExpandMore />}
            </Button>
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
                    sx={{ textTransform: "none" }}
                    startIcon={<TextFieldsIcon />}
                  >
                    Add Text
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => openNewElementModal("image")}
                    sx={{ textTransform: "none" }}
                    startIcon={<CameraAltIcon />}
                  >
                    Add Image
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => openNewElementModal("video")}
                    sx={{ textTransform: "none" }}
                    startIcon={<OndemandVideoIcon />}
                  >
                    Add Video
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => openNewElementModal("code")}
                    sx={{ textTransform: "none" }}
                    startIcon={<CodeIcon />}
                  >
                    Add Code
                  </Button>
                </Box>
              </List>
            </Collapse>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeletePopup(true)}
                startIcon={<DeleteForeverIcon />}
              >
                Delete Presentation
              </Button>
            </Box>
          </List>
        </Box>
        <Box>
          {/* render element  */}
          <Box sx={{ ...slideBox, ...renderBackground() }}>
            {elements
              .slice()
              .sort((a, b) => a.layer - b.layer)
              .map((element) => (
                <Box
                  key={element.id}
                  sx={{
                    position: "absolute",
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    width: `${element.width || 50}%`,
                    height: `${element.height || 50}%`,
                    fontFamily: element.fontFamily || "inherit",
                    border: "1px solid grey",
                    padding: "10px",
                    margin: "10px",
                    zIndex: element.layer,
                    overflow: "hidden",
                    whiteSpace: "wrap",
                  }}
                  // double click edit element
                  onDoubleClick={() => {
                    setHandlingElement(element);
                    setElementModalDisplay(true);
                  }}
                  // right click delete element
                  onContextMenu={(e) => {
                    e.preventDefault();
                    deleteElement(element.id);
                  }}
                >
                  {/* render different element */}
                  {/* text */}
                  {element.type === "text" && (
                    <Typography
                      sx={{
                        fontSize: `${element.fontSize}em`,
                        color: element.color,
                      }}
                    >
                      {element.text}
                    </Typography>
                  )}
                  {/* image */}
                  {element.type === "image" && (
                    <Box
                      component="img"
                      src={element.url}
                      alt={element.alt}
                      sx={{ width: "100%", height: "100%" }}
                    />
                  )}
                  {/* video */}
                  {element.type === "video" && (
                    <Box
                      onDoubleClick={() => {
                        setHandlingElement(element);
                        setElementModalDisplay(true);
                      }}
                      sx={{
                        width: "100%",
                        height: "100%",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        component="iframe"
                        src={`${element.url}${
                          element.autoPlay ? "?autoplay=1" : ""
                        }`}
                        title="YouTube video"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        sx={{
                          width: "100%",
                          height: "100%",
                          pointerEvents: "auto",
                        }}
                      />
                    </Box>
                  )}
                  {element.type === "code" && element.code && (
                    <CodeHighlighter
                      code={element.code}
                      fontSize={element.fontSize}
                    />
                  )}
                </Box>
              ))}
            <Box id="current-slide-index" sx={{ ...slideNumberBox }}>
              {currentSlideIndex + 1}
            </Box>
          </Box>
          <Box
            sx={{ display: "flex", alignItems: "center", marginTop: "20px" }}
          >
            <IconButton
              id="previous-slide-button"
              onClick={goToPreviousSlide}
              disabled={currentSlideIndex === 0}
            >
              <ArrowBackIcon
                sx={{
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                }}
              />
            </IconButton>
            <span>
              Slide {currentSlideIndex + 1} of {presentation.slides.length}
            </span>
            <IconButton
              id="next-slide-button"
              onClick={goToNextSlide}
              disabled={currentSlideIndex === presentation.slides.length - 1}
            >
              <ArrowForwardIcon
                sx={{
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                }}
              />
            </IconButton>
            <Button id="add-slide-button" onClick={addNewSlide}>
              Add Slide
            </Button>
            <Button onClick={deleteSlide}>Delete Slide</Button>
          </Box>
        </Box>
      </Box>
      {/* edit elements modal */}
      <BackgroundSettings
        open={backgroundModalDisplay}
        onClose={() => setBackgroundModalDisplay(false)}
        presentation={presentation}
        setPresentation={setPresentation}
        currentSlideIndex={currentSlideIndex}
        presentationId={presentationId}
      />
      <Modal
        open={elementModalDisplay}
        onClose={() => setElementModalDisplay(false)}
      >
        <Box sx={{ ...modalStyle }}>
          <h2>Edit {handlingElement?.type} Properties</h2>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              gridAutoRows: "auto",
            }}
          >
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
              label="Width (%)"
              name="width"
              value={handlingElement?.width || ""}
              onChange={handleChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Height (%)"
              name="height"
              value={handlingElement?.height || ""}
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
          </Box>
          {/* different type*/}
          {/* text */}
          {handlingElement?.type === "text" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
              }}
            >
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
              <TextField
                label="Text"
                name="text"
                value={handlingElement.text || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2, gridColumn: "span 2" }}
                multiline
                rows={5}
              />
            </Box>
          )}
          {/* image */}
          {handlingElement?.type === "image" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
              }}
            >
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
            </Box>
          )}
          {/* video */}
          {handlingElement?.type === "video" && (
            <Box
              sx={{
                gap: 2,
              }}
            >
              <TextField
                label="Video URL"
                name="url"
                value={handlingElement.url || ""}
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
            </Box>
          )}
          {/* code */}
          {handlingElement?.type === "code" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                gridAutoRows: "auto",
              }}
            >
              <TextField
                label="Font Size (em)"
                name="fontSize"
                value={handlingElement.fontSize || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Code"
                name="code"
                value={handlingElement.code || ""}
                onChange={handleChange}
                fullWidth
                multiline
                rows={5}
                sx={{ mt: 2, gridColumn: "span 2" }}
              />
            </Box>
          )}
          {/* save button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={saveElement} variant="contained">
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
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
            id="presentation-title-input"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            id="presentation-description-input"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <TextField
            id="thumbnail-url-input"
            label="Thumbnail URL"
            value={customThumbnailURL || thumbnail}
            onChange={(e) => setCustomThumbnailURL(e.target.value)}
            fullWidth
          />
          <Button
            id="save-title-thumbnail-button"
            onClick={saveTitleAndThumbnail}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

const slideBox = {
  position: "relative",
  maxWidth: "100%",
  height: "400px",
  border: "1px solid #ddd",
  marginTop: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px",
  "@media (min-width: 700px)": {
    width: "700px",
    height: "400px",
    marginTop: "10px",
  },
  "@media (max-width: 700px)": {
    height: "300px",
    minWidth: "300px",
    padding: "8px",
    fontSize: "0.9em",
  },
  "@media (mim-width: 400px)": {
    height: "250px",
    maxWidth: "100%",
    padding: "5px",
    fontSize: "0.9em",
  },
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

export default EditPresentation;
