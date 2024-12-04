import React from 'react'; 
import '../style/LoadingModal.css'; // Import the CSS 

// Functional component for the loading modal
const LoadingModal = ({ show }) => {
  // If 'show' prop is false, don't render anything
  if (!show) return null;

  // Render the modal with a spinner and loading text
  return (
    <div className="loading-modal">
      <div className="loading-content">
        <div className="spinner"></div> {/* Spinner for visual loading indication */}
        <p>Loading...</p> 
      </div>
    </div>
  );
};

export default LoadingModal;