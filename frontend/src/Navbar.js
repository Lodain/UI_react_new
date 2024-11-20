import './style/Navbar.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Navbar = ({ setUser }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUserState] = useState(null);

  const backendURL = 'http://127.0.0.1:8080';

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const storedUser = JSON.parse(sessionStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
        setUserState(storedUser);
      }
    }
  }, [setUser]);

  const handleLogin = () => {
    console.log('Login button clicked');
    axios.post(`${backendURL}/token/`, { username, password })
      .then(response => {
        console.log('Login successful:', response.data);
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        
        // Fetch user information
        axios.post(`${backendURL}/get-user-info/`, { username })
          .then(userResponse => {
            const userData = userResponse.data;
            console.log('User data to be stored:', userData);
            sessionStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setUserState(userData);
            console.log('User set in session storage:', userData);
            setShowLoginModal(false);
          })
          .catch(error => {
            console.error('Error fetching user info:', error);
          });
      })
      .catch(error => {
        console.error('Login error:', error);
        // Optionally, display an error message to the user
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    setUser(null);
    setUserState(null);
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/';
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