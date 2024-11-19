import './style/Navbar.css';
import React, { useState } from 'react';
import axios from 'axios';

const Navbar = ({ user, setUser }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Define the backend URL (you can also use environment variables)
  const backendURL = 'http://127.0.0.1:8080';

  const handleLogin = () => {
    console.log('Login button clicked');
    axios.post(`${backendURL}/token/`, { username, password })
      .then(response => {
        console.log('Login successful:', response.data);
        // Store tokens securely
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        setUser({ username }); // Update your user state accordingly
        setShowLoginModal(false);
        // Set Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      })
      .catch(error => {
        console.error('Login error:', error);
        // Handle login errors (e.g., display error message)
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login/';
  };

  return (
    <nav className="top-right-buttons">
      <button onClick={() => window.location.href = '/home'}>Home</button>
      {user ? (
        <>
          <button onClick={() => window.location.href = '/account'}>Account</button>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={() => setShowLoginModal(true)}>Login</button>
          <button onClick={() => window.location.href = '/register'}>Register</button>
        </>
      )}

      {showLoginModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowLoginModal(false)}>&times;</span>
            <h2>Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;