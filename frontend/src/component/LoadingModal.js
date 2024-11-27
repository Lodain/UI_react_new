import React from 'react';
import '../style/LoadingModal.css'; // Ensure you have some basic styles

const LoadingModal = ({ show }) => {
  if (!show) return null;

  return (
    <div className="loading-modal">
      <div className="loading-content">
        <div className="spinner"></div> {/* Add your loading animation here */}
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default LoadingModal;