import React, { useState } from 'react';
import axios from 'axios';

const RegisterModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8080/register/', formData)
      .then(response => {
        alert('Registration successful! Please check your email to verify your account.');
        onClose();
      })
      .catch(error => {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
      });
    console.log(formData);
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Register</h2>
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
  );
};

export default RegisterModal;