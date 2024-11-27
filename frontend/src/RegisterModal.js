import React, { useState } from 'react';
import axios from 'axios';
import LoadingModal from './component/LoadingModal';
import SuccessModal from './component/SuccessModal';
import './style/RegisterModal.css';

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

  if (!show) return null;

  return (
    <>
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
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
        <LoadingModal show={isLoading} />
      </div>
      <SuccessModal show={isSuccess} onClose={() => { setIsSuccess(false); onClose(); }} />
    </>
  );
};

export default RegisterModal;