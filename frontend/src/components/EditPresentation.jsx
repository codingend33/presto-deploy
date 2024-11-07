import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiCall from '../api';
import { TextField, Button, Box, Modal, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const EditPresentation = () => {
  const params = useParams();
  let presentationId = params.id;
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [customThumbnailURL, setCustomThumbnailURL] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [deletePopup, setDeletePopup] = useState(false);
  const [showTitleEditModal, setShowTitleEditModal] = useState(false);

  const [elements, setElements] = useState([]); 
  const [elementModalDisplay, setElementModalDisplay] = useState(false); 
  const [handlingElement, setHandlingElement] = useState(null); 

  const token = localStorage.getItem('token');

  useEffect(() => {
    const getPresentation = async () => {
      try {
        const response = await apiCall('/store', 'GET', {}, token);
        console.log('edit界面 response:', response);
        const userStore = response.store;
        if (userStore && userStore[presentationId]) {
          const currentPres = userStore[presentationId];
          setPresentation(currentPres);
          setTitle(currentPres.title || '');
          setThumbnail(
            currentPres.thumbnail || (currentPres.slides && currentPres.slides.length > 0 ? currentPres.slides[0].content : '')
          );
          setElements(currentPres.slides[currentSlideIndex]?.elements || []);
        } else {
          console.error('Presentation not found');
        }
      } catch (error) {
        console.error('Failed to get presentation:', error.message);
      }
    };
    getPresentation();
  }, [presentationId, token, currentSlideIndex]);

  // open new element modal
  const openNewElementModal=(type)=>{
    setHandlingElement({type,x: 0, y: 0, width: 50, height: 50 });
    setElementModalDisplay(true);
  }

  
  // handle elements change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingElement({ ...editingElement, [name]: value });
  };
    



  // Delete Presentation
  const deletePresentation = async () => {
    try {
      const response = await apiCall('/store', 'GET', {}, token);
      const getStore = { ...response.store };
      delete getStore[presentationId];
      await apiCall('/store', 'PUT', { store: getStore }, token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete presentation:', error.message);
    }
  };

  const saveTitleAndThumbnail = async () => {
    try {
      const updatedPresentation = {
        ...presentation,
        title:title,
        thumbnail: customThumbnailURL || thumbnail, 
      };
      const response = await apiCall('/store', 'GET', {}, token);
      const updatedStore = { ...response.store, [presentationId]: updatedPresentation };
      await apiCall('/store', 'PUT', { store: updatedStore }, token);
      setPresentation(updatedPresentation);
      setShowTitleEditModal(false);
    } catch (error) {
      console.error('Failed to update title:', error.message);
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

    const newSlide = { slide_id: `slide_${Date.now()}`, content: '', position: presentation.slides.length + 1 };

    const updatedSlides = [...presentation.slides, newSlide].map((slide, index) => ({
      ...slide,
      position: index + 1, 
    }));

    const updatedPresentation = {
      ...presentation,
      slides: updatedSlides,
    };

    try {
      const response = await apiCall('/store', 'GET', {}, token);
      const updatedStore = { ...response.store, [presentationId]: updatedPresentation };
      await apiCall('/store', 'PUT', { store: updatedStore }, token);
      setPresentation(updatedPresentation);
      setCurrentSlideIndex(updatedPresentation.slides.length - 1);
    } catch (error) {
      console.error('Failed to add slide:', error.message);
    }
  };

  // Delete Slide
  const deleteSlide = async () => {
    if (presentation.slides.length === 1) {
      alert('Cannot delete the only slide. Delete the presentation instead.');
      return;
    }

    const updatedSlides = presentation.slides.filter((slide, index) => index !== currentSlideIndex)
    const sortedSlides =updatedSlides.map((slide, index) => ({
      ...slide,
      position: index + 1, 
    }));

    const updatedPresentation = {
      ...presentation,
      slides: sortedSlides,
    };

    try {
      const response = await apiCall('/store', 'GET', {}, token);
      const updatedStore = { ...response.store, [presentationId]: updatedPresentation };
      await apiCall('/store', 'PUT', { store: updatedStore }, token);
      setPresentation(updatedPresentation);
      setCurrentSlideIndex(Math.max(currentSlideIndex - 1, 0));
    } catch (error) {
      console.error('Failed to delete slide:', error.message);
    }
  };

  if (!presentation) {
    return <div>No presentation...</div>;
  }

  return (

    <Box sx={{ padding: '20px' }}         
      tabIndex={0} 
      onKeyDown={(e) => {
      if (e.key === 'ArrowLeft') goToPreviousSlide();
      if (e.key === 'ArrowRight') goToNextSlide();
      }}>

      <div>
      <Button onClick={() => navigate('/logout')}>Logout</Button>
      <Button onClick={() => navigate('/dashboard')}>Back</Button>
      </div>
      
      <h1>{presentation.title}</h1>
      
      <div>
        <Button onClick={() => setDeletePopup(true)}>Delete Presentation</Button>
        <Button onClick={() => setShowTitleEditModal(true)}>Edit Title & Thumbnail</Button>
      </div>

       {/* add elements  */}
      <Box sx={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <Button onClick={() => openNewElementModal('text')}>Add Text</Button>
        <Button onClick={() => openNewElementModal('image')}>Add Image</Button>
        <Button onClick={() => openNewElementModal('video')}>Add Video</Button>
        <Button onClick={() => openNewElementModal('code')}>Add Code</Button>
      </Box>


      {/* edit elements modal */}
      <Modal open={elementModalDisplay} onClose={() => setElementModalDisplay(false)}>
        <Box sx={{ ...modalStyle }}>
          <h2>Edit {handlingElement?.type} Properties</h2>
          <TextField label="X Position (%)" name="x" value={handlingElement?.x || ''} onChange={handleChange} fullWidth />
          <TextField label="Y Position (%)" name="y" value={handlingElement?.y || ''} onChange={handleChange} fullWidth />
        </Box>
      </Modal>

      <Box sx={{ ...slideBox }}>
        <Box sx={{...slideNumberBox}}>{currentSlideIndex + 1}</Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
        <IconButton onClick={goToPreviousSlide} disabled={currentSlideIndex === 0}>
          <ArrowBackIcon />
        </IconButton>
        <span>Slide {currentSlideIndex + 1} of {presentation.slides.length}</span>
        <IconButton onClick={goToNextSlide} disabled={currentSlideIndex === presentation.slides.length - 1}>
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

      <Modal open={showTitleEditModal} onClose={() => setShowTitleEditModal(false)}>
        <Box sx={{ ...modalStyle }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField label="Custom Thumbnail URL" value={customThumbnailURL} onChange={(e) => setCustomThumbnailURL(e.target.value)} fullWidth/>
          <Button onClick={saveTitleAndThumbnail}>Save</Button>
        </Box>
      </Modal>

    </Box>
  );
};

const slideBox ={
  position: 'relative',
  width: '100%',
  height: '400px',
  border: '1px solid #ddd',
  marginTop: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
const slideNumberBox ={
  position: 'absolute',
  bottom: '10px',
  left: '10px',
  width: '50px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1em',
  color: 'black',
  border: '1px solid black',
  borderRadius: '5px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
}
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default EditPresentation;
