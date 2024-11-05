import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const PresentationCard = ({ presentation, presentationId }) => { 
  const navigate = useNavigate(); 
  console.log("Presentation data:", presentation);
  console.log('presentation length',presentation.slides.length);

  const handleClick = () => { 
    navigate(`/presentations/${presentationId}`); 
  };

  return (
    <Card onClick={handleClick} sx={{ width: 200, height: 100, cursor: 'pointer' }}>
      <CardContent>
        <Typography variant="h5">{presentation.title}</Typography> 
        <Typography variant="body2" color="textSecondary">
          {presentation.description || 'No description'} 
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Slides: {presentation.slides ? presentation.slides.length : 0}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PresentationCard; 
