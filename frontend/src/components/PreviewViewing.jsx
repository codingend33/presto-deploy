import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import apiCall from "../api";
import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const PreviewViewing = () => {
  const params = useParams();
  const location = useLocation();
  const presentationId = params.id;
  const [presentation, setPresentation] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const getPresentation = async () => {
      try {
        setLoading(true);
        const response = await apiCall("/store", "GET", {}, token);
        console.log("API Response:", response);
        if (response && response.store && response.store[presentationId]) {
          setPresentation(response.store[presentationId]);
        } else {
          console.error("Presentation not found");
        }
      } catch (error) {
        console.error("Failed to load presentation:", error.message);
      } finally {
        setLoading(false);
      }
    };

    const urlParams = new URLSearchParams(location.search);
    const slide = parseInt(urlParams.get("slide"), 10);
    if (!isNaN(slide)) {
      setCurrentSlideIndex(slide);
    }
    getPresentation();
  }, [presentationId, location.search, token]);

  useEffect(() => {
    if (presentation) {
      const newUrl = `/preview/${presentationId}?slide=${currentSlideIndex}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [currentSlideIndex, presentationId, presentation]);

  const goToPreviousSlide = () => {
    setCurrentSlideIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  const goToNextSlide = () => {
    if (presentation && presentation.slides) {
      setCurrentSlideIndex((prevIndex) =>
        prevIndex < presentation.slides.length - 1 ? prevIndex + 1 : prevIndex
      );
    }
  };

  if (loading) {
    return <div>loading...</div>;
  }

  const currentSlide = presentation.slides[currentSlideIndex];

  // Function to render each element based on its type
  const renderElement = (element) => {
    // Ensure the element and its type are defined
    if (!element || !element.type) {
      return null;
    }
    const style = {
      position: "absolute",
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
    };
    switch (element.type) {
      case "text":
        return (
          <div
            key={element.id}
            style={{
              ...style,
              fontSize: `${element.fontSize * 10}px`,
              color: element.color || "black",
              fontFamily: element.fontFamily || "Arial",
            }}
          >
            {element.text}
          </div>
        );
      case "image":
        return (
          <img
            key={element.id}
            src={element.url}
            alt="Slide Image"
            style={style}
          />
        );
      case "video":
        return (
          <iframe
            key={element.id}
            src={element.url}
            title="Video"
            style={style}
            autoPlay={element.autoPlay ? "autoPlay" : undefined}
          />
        );
      case "code":
        return (
          <pre
            key={element.id}
            style={{
              ...style,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              backgroundColor: "#f5f5f5",
              padding: "10px",
            }}
          >
            {element.code}
          </pre>
        );
      default:
        return null;
    }
  };

  const backgroundStyle = currentSlide.background
    ? currentSlide.background.type === "gradient"
      ? {
          background: `linear-gradient(${currentSlide.background.colors.join(
            ", "
          )})`,
        }
      : currentSlide.background.type === "image"
      ? {
          backgroundImage: `url(${currentSlide.background.url})`,
          backgroundSize: "cover",
        }
      : { backgroundColor: currentSlide.background.color || "#ffffff" }
    : { backgroundColor: "#ffffff" };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        ...backgroundStyle,
      }}
    >
      <Box
        sx={{
          width: "80%",
          height: "80%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {currentSlide.elements && currentSlide.elements.map(renderElement)}
      </Box>
      {/* navigate */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 2,
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <IconButton
          onClick={goToPreviousSlide}
          disabled={currentSlideIndex === 0}
          sx={{
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <span>{`Slide ${currentSlideIndex + 1} of ${
          presentation.slides.length
        }`}</span>
        <IconButton
          onClick={goToNextSlide}
          disabled={currentSlideIndex === presentation.slides.length - 1}
          sx={{
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            },
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PreviewViewing;
