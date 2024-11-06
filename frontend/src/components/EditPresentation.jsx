import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiCall from '../api';

const EditPresentation = () => {
  const params = useParams();
  let presentationId = params.id;
  const navigate = useNavigate();

  const [presentation, setPresentation] = useState(null);
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');

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
        } else {
          console.error('Presentation not found');
        }
      } catch (error) {
        console.error('Failed to get presentation:', error.message);
      }
    };
    getPresentation();
  }, [presentationId, token]);

  return (
    <h1>edit slide</h1>
  )
};

export default EditPresentation;
