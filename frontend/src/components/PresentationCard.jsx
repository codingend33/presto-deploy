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

  const handleClick = () => {
    navigate(`/presentations/${presentationId}`);
  };

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
            bgcolor: presentation.thumbnail ? "transparent" : "#e0e0e0",
          }}
        >
          {presentation.thumbnail && (
            <img
              src={presentation.thumbnail}
              alt="Presentation Thumbnail"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          )}
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
              </span>
              <span>Created At: {formatDate(presentation.createdAt)}</span>
            </Box>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
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
