// EmailVerification.js
import React, { useEffect, useState } from 'react';

const EmailVerification = () => {
  const [verificationMessage, setVerificationMessage] = useState('Processing your request...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');

    if (status === 'success') {
      setVerificationMessage('Email verified successfully!');
    } else {
      setVerificationMessage('Email verification failed.');
    }
  }, []);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{verificationMessage}</p>
    </div>
  );
};

export default EmailVerification;