import './style/Navbar.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RegisterModal from './RegisterModal';

const Navbar = ({ setUser }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
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
    axios.post(`${backendURL}/token/`, { username, password })
      .then(response => {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        
        axios.post(`${backendURL}/get-user-info/`, { username })
          .then(userResponse => {
            const userData = userResponse.data;
            sessionStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setUserState(userData);
            setShowLoginModal(false);
          })
          .catch(error => {
            console.error('Error fetching user info:', error);
          });
      })
      .catch(error => {
        console.error('Login error:', error);
      });
  };

  return (
    <nav className="top-right-buttons">
      <button onClick={() => window.location.href = '/home'}>Home</button>
      {user ? (
        <>
          <button onClick={() => window.location.href = '/account'}>Account</button>
          <button onClick={() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('user');
            setUser(null);
            setUserState(null);
            delete axios.defaults.headers.common['Authorization'];
            window.location.href = '/';
          }}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={() => setShowLoginModal(true)}>Login</button>
          <button onClick={() => setShowRegisterModal(true)}>Register</button>
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

      <RegisterModal show={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
    </nav>
  );
};

export default Navbar;