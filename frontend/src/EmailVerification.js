// EmailVerification.js
import React, { useEffect } from 'react';
import axios from 'axios';

const EmailVerification = () => {
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const uid = pathParts[2];
    const token = pathParts[3];

    axios.get(`http://127.0.0.1:8080/verify-email/${uid}/${token}`)
      .then(response => {
        alert('Email verified successfully!');
      })
      .catch(error => {
        alert('Email verification failed.');
      });
  }, []);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>Processing your request...</p>
    </div>
  );
};

export default EmailVerification;