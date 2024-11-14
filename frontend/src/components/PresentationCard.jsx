import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  Box,
  CardMedia,
  Typography,
  CardActionArea,
} from "@mui/material";

const PresentationCard = ({ presentation, presentationId }) => {
  const navigate = useNavigate();
  // Handles click event to navigate to the presentation detail page
  const handleClick = () => {
    navigate(`/presentations/${presentationId}`);
  };
  // Formats the date string to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card onClick={handleClick} sx={{ ...cardStyle }}>
      <CardActionArea>
        <CardMedia
          component="div"
          sx={{
            ...cardMediaStyle,
            backgroundColor: presentation.thumbnail ? "transparent" : "#e0e0e0",
          }}
        >
          {presentation.thumbnail ? (
            <Box
              component="img"
              src={presentation.thumbnail}
              sx={thumbnailStyle}
              alt="Presentation Thumbnail"
              // Set background to gray if thumbnail empty
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.style.backgroundColor = "#e0e0e0";
              }}
            />
          ) : null}
        </CardMedia>

        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            paddingBottom: "5px",
          }}
        >
          <Typography variant="h5">
            {presentation.title || "Untitled"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Description: {presentation.description || "No description"}
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            <Box display="flex" justifyContent="space-between">
              <span>
                Slides: {presentation.slides ? presentation.slides.length : 0}
                {/* Shows the number of slides */}
              </span>
              <span>Created At: {formatDate(presentation.createdAt)}</span>{" "}
              {/* Shows formatted creation date */}
            </Box>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const thumbnailStyle = {
  maxWidth: "100%",
  maxHeight: "100%",
};

const cardStyle = {
  width: 360,
  height: 180,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: 2,
  transition: "transform 0.2s, box-shadow 0.2s",
  ":hover": {
    transform: "scale(1.05)",
    boxShadow: 6,
  },
};

const cardMediaStyle = {
  height: "80px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  paddingTop: "5px",
};

export default PresentationCard;
