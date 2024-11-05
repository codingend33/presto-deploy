import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiCall from '../api';

const EditPresentation = () => {
  const { id } = useParams(); 
  console.log(id);
  const [presentation, setPresentation] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        const response = await apiCall('/store', 'GET', {}, token);
        const userStore = response.store;
        if (userStore && userStore[id]) {
          setPresentation(userStore[id]); 
        } else {
          console.error('Presentation not found');
        }
      } catch (error) {
        console.error('Failed to fetch presentation:', error.message);
      }
    };
    fetchPresentation();
  }, [id, token]);

  return (
    <div>
      <h1>{presentation.title}</h1>
    </div>
  );
};

export default EditPresentation;
