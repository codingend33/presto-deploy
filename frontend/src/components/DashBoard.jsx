import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCall from '../api';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import PresentationCard from '../components/PresentationCard';


const Dashboard = () => {
  const [presentations, setPresentations] = useState({});
  const [displayModal, setDisplayModal] = useState(false); 
  const [newPresentationName, setNewPresentationName] = useState(''); 
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); 
  const userId = localStorage.getItem('email');

  useEffect(() => {
    const getPresentations = async () => {
      try {
        const response = await apiCall('/store', 'GET', {}, token);
        console.log("Response:", response);
  
        if (response && response.store) {
          setPresentations(response.store);
        } else {
          console.warn('No store available');
          setPresentations({}); 
        }
      } catch (error) {
        console.error('Failed to get presentations:', error.message);
      }
    };
    getPresentations();
  }, [token]);
  

  const modalOpen = () => setDisplayModal(true);
  const modalClose = () => setDisplayModal(false);

  const createPresentation = async () => {
    const newPresentationId = `presentation_${Date.now()}`; 
    const newPresentation = {
      title: newPresentationName,
      description: '',
      thumbnail: '',
      slides: [{ slide_id: `slide_${Date.now()}`, content: '', position: 1 }]
    };
  
    const existingStore = presentations || {};
    const updatedStore = {
      ...existingStore,
      [newPresentationId]: newPresentation
    };
  
    const updatedData = {
      store: updatedStore 
    };
  
    try {
      await apiCall('/store', 'PUT', updatedData, token);
      setPresentations(updatedStore);
      setNewPresentationName(''); 
      modalClose(); 
    } catch (error) {
      console.error('Failed to create presentation:', error.message);
    }
  };
  
  return (
    <Box sx={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <Button onClick={() => navigate('/logout')}>Logout</Button>
      <Button variant="contained" onClick={modalOpen} sx={{ textTransform: 'none' }}>New Presentation</Button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px'}}>
        {presentations && Object.keys(presentations).map((key) => (
          <PresentationCard key={key} presentation={presentations[key]} presentationId={key} />
        ))}
      </div>

      <Modal open={displayModal} onClose={modalClose}>
        <Box sx={{ ...modalStyle }}>
          <h2>Create New Presentation</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <TextField
                label="Presentation Name"
                variant="filled"
                value={newPresentationName}
                onChange={(e) => setNewPresentationName(e.target.value)}
            />
            <Button variant="contained" onClick={createPresentation} sx={{ textTransform: 'none' }}>
                Create
            </Button>
          </div>
        </Box>
      </Modal>
    </Box>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 50,
  p: 5,
};

export default Dashboard;
