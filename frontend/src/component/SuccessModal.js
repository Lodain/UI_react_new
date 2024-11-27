import React from 'react';
import '../style/SuccessModal.css';

const SuccessModal = ({ show, onClose }) => {
  if (!show) return null;

  const handleOk = () => {
    onClose();
    window.location.href = '/'; // Redirect to homepage
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Success</h2>
        <p>Your account has been created successfully!</p>
        <button onClick={handleOk}>OK</button>
      </div>
    </div>
  );
};

export default SuccessModal;