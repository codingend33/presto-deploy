import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';

const PresentationCard = ({ presentation, presentationId }) => {

  const navigate = useNavigate();
  console.log('length',presentation.slides.length);
  console.log('thumbnail',presentation.thumbnail);
  const handleClick = () => {
    navigate(`/presentations/${presentationId}`);
  };

  return (
    <Card onClick={handleClick} sx={{...cardStyle}}>
      <CardActionArea>
        <CardMedia component="div" sx={{...cardMediaStyle, bgcolor: presentation.thumbnail ? 'transparent' : '#e0e0e0',}}>
          {presentation.thumbnail &&(<img src={presentation.thumbnail} alt="Presentation Thumbnail" style={{ maxWidth: '100%', maxHeight: '100%' }} />)}
        </CardMedia>

        <CardContent sx={{display: 'flex', flexDirection: 'column', gap: '3px',padding:'10px' }}>
          <Typography variant="h5"> { presentation.title || 'Untitled' } </Typography>
          <Typography variant="body2" color="text.secondary">
            {presentation.description || 'No description'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Slides: {presentation.slides ? presentation.slides.length : 0}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};


const cardStyle ={
  width: 360, 
  height: 180, 
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxShadow: 2,
  transition: 'transform 0.2s, box-shadow 0.2s',
  ':hover': {
    transform: 'scale(1.05)',
    boxShadow: 6,
  }
}

const cardMediaStyle={
  height: '80px', 
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

export default PresentationCard;
