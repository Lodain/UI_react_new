import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingModal from './LoadingModal';
import SuccessModal from './SuccessModal';
import '../style/RegisterModal.css';
import RegisterImage from '../img/Register.PNG';

// RegisterModal component definition
const RegisterModal = ({ show, onClose }) => {
  // State for form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });
  // State for loading status
  const [isLoading, setIsLoading] = useState(false);
  // State for error messages
  const [errorMessage, setErrorMessage] = useState('');
  // State for success status
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrorMessage(''); // Clear error message on input change
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loading modal
    setErrorMessage(''); // Clear previous error messages
    axios.post('http://127.0.0.1:8080/register/', formData)
      .then(response => {
        setIsSuccess(true); // Show success modal
        setIsLoading(false); // Hide loading modal
      })
      .catch(error => {
        console.error('Registration error:', error);
        setErrorMessage(error.response.data.error || 'Registration failed. Please try again.');
        setIsLoading(false); // Hide loading modal
      });
    console.log(formData); // Log form data for debugging
  };

  // Toggle body overflow to prevent background scrolling when modal is open
  const toggleBodyOverflow = (isModalOpen) => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
  };

  // Effect to handle body overflow when modal visibility changes
  useEffect(() => {
    toggleBodyOverflow(show);
    return () => toggleBodyOverflow(false); // Reset overflow when component unmounts
  }, [show]);

  // Return null if modal is not shown
  if (!show) return null;

  return (
    <>
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => {
            onClose();
            toggleBodyOverflow(false); // Reset overflow when modal closes
          }}>&times;</span>
          <div className="register-modal-body">
            <img src={RegisterImage} alt="Register" className="register-image" />
            <div className="register-form">
              <h2>Register</h2>
              {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}
              <form onSubmit={handleSubmit}>
                <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
                <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Register</button>
              </form>
            </div>
          </div>
        </div>
        <LoadingModal show={isLoading} />
      </div>
      <SuccessModal show={isSuccess} onClose={() => { setIsSuccess(false); onClose(); }} />
    </>
  );
};

export default RegisterModal;