import React from 'react';
import '../style/LoadingModal.css';

const LoadingModal = ({ show }) => {
  if (!show) return null;

  return (
    <div className="loading-modal">
      <div className="loading-content">
        <div className="spinner"></div> 
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default LoadingModal;