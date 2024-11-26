import React, { useState } from 'react';
import axios from 'axios';

function ResetPassword({ uid, token }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8080/reset-password-confirm/', {
        uid,
        token,
        new_password: newPassword
      });

      setMessage('Password reset successful! Redirecting to home page...');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h2>Reset Password</h2>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724',
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;