import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingModal from './component/LoadingModal';
import SuccessModal from './component/SuccessModal';
import './style/RegisterModal.css';
import RegisterImage from './img/Register.PNG';

const RegisterModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    axios.post('http://127.0.0.1:8080/register/', formData)
      .then(response => {
        setIsSuccess(true);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Registration error:', error);
        setErrorMessage(error.response.data.error || 'Registration failed. Please try again.');
        setIsLoading(false);
      });
    console.log(formData);
  };

  const toggleBodyOverflow = (isModalOpen) => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
  };

  useEffect(() => {
    toggleBodyOverflow(show);
    return () => toggleBodyOverflow(false); // Reset overflow when component unmounts
  }, [show]);

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