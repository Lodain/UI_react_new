import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/ResetPassword.css';

function ResetPassword() {
  // Extracting uid and token from URL parameters
  const { uid, token } = useParams();
  const navigate = useNavigate();

  // State variables for form inputs and messages
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Send POST request to reset password
      await axios.post('http://127.0.0.1:8080/reset-password-confirm/', {
        uid: uid,
        token: token,
        new_password: newPassword,
        re_new_password: confirmPassword
      });

      // Set success message and redirect after 3 seconds
      setMessage('Password reset successful! Redirecting to home page...');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      // Set error message if request fails
      setError(err.response?.data?.error || 'Password reset failed');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2>Reset Password</h2>
        
        {/* Display success message if present */}
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {/* Display error message if present */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Form for password reset */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="reset-button">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;