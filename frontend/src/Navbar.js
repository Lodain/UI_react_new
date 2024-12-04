import './style/Navbar.css';
import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import RegisterModal from './RegisterModal';
import LoadingModal from './component/LoadingModal';
import LoginImage from './img/Login.PNG';
import { Link, useLocation } from 'react-router-dom';

// Navbar component to handle navigation and user authentication
const Navbar = ({ user, setUser }) => {
  const location = useLocation(); // Hook to get the current route location
  const isActive = (path) => location.pathname === path; // Function to check if a path is active

  // State variables for managing modals and user input
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [isUserInactive, setIsUserInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Function to toggle body overflow when modals are open
  const toggleBodyOverflow = (isModalOpen) => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
  };

  // Effect to handle body overflow based on modal visibility
  useEffect(() => {
    toggleBodyOverflow(showLoginModal || showRegisterModal);
  }, [showLoginModal, showRegisterModal]);

  // Effect to set authorization headers if token is present
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const storedUser = JSON.parse(sessionStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
      }
    }
  }, [setUser]);

  // Function to handle user login
  const handleLogin = () => {
    setIsLoading(true);
    axiosInstance.post('/get-user-info/', { username })
      .then(userResponse => {
        const userData = userResponse.data;
        if (userData.error) {
          setLoginErrorMessage(userData.error);
          setIsLoading(false);
          return;
        }
        
        axiosInstance.post('/token/', { username, password })
          .then(response => {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
            
            sessionStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            window.location.href = '/';
          })
          .catch(error => {
            console.error('Token retrieval error:', error);
            setLoginErrorMessage('Invalid credentials. Please try again.');
            setIsLoading(false);
          });
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
        if (error.response?.status === 403) {
          setIsUserInactive(true);
          setLoginErrorMessage('User account is inactive. Please verify your email.');
        } else {
          setLoginErrorMessage('Invalid credentials. Please try again.');
        }
        setIsLoading(false);
      });
  };

  // Function to handle input changes and reset error messages
  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
    setLoginErrorMessage('');
    setIsUserInactive(false);
  };

  // Function to handle forgot password requests
  const handleForgotPassword = () => {
    axiosInstance.post('/forgot-password/', { email: forgotEmail })
      .then(response => {
        setResetMessage('Password reset instructions have been sent to your email.');
        setForgotEmail('');
      })
      .catch(error => {
        setResetMessage(error.response?.data?.error || 'An error occurred');
      });
  };

  // Function to handle resending verification emails
  const handleResendVerification = () => {
    axiosInstance.post('/resend-verification/', { email: resendEmail })
      .then(response => {
        setResendMessage('Verification email has been resent. Please check your inbox.');
        setTimeout(() => {
          setShowResendVerification(false);
          setResendMessage('');
        }, 3000);
      })
      .catch(error => {
        setResendMessage(error.response?.data?.error || 'An error occurred');
      });
  };

  // Function to toggle the menu open/close state
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Function to close the menu
  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="top-right-buttons">
      {/* Main navigation bar container */}
      <span className="navbar-title">BiblioBase</span>
      <div className="left-buttons">
        {/* Left side navigation links */}
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={handleMenuClose}>Home</Link>
        {user && (
          <>
            {/* Links shown when user is logged in */}
            <Link to="/account" className={`nav-link ${isActive('/account') ? 'active' : ''}`} onClick={handleMenuClose}>Account</Link>
            <Link to="/borrow" className={`nav-link ${isActive('/borrow') ? 'active' : ''}`} onClick={handleMenuClose}>Borrow</Link>
            {user.staff && (
              /* Librarian link shown only for staff users */
              <Link to="/librarian" className={`nav-link librarian ${isActive('/librarian') ? 'active' : ''}`} onClick={handleMenuClose}>Librarian</Link>
            )}
            {user.superuser && user.staff && (
              /* Admin link shown only for superuser staff */
              <a href="http://127.0.0.1:8080/admin/" 
                 className={`nav-link admin ${isActive('/admin') ? 'active' : ''}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 onClick={handleMenuClose}>
                Admin
              </a>
            )}
          </>
        )}
      </div>
      <div className="right-buttons">
        {/* Right side buttons for authentication */}
        {user ? (
          /* Logout button when user is logged in */
          <button onClick={() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('user');
            setUser(null);
            delete axiosInstance.defaults.headers.common['Authorization'];
            window.location.href = '/';
            handleMenuClose();
          }}>Logout</button>
        ) : (
          <>
            {/* Register and Login buttons when no user is logged in */}
            <button onClick={() => { setShowRegisterModal(true); handleMenuClose(); }}>Register</button>
            <button onClick={() => { setShowLoginModal(true); handleMenuClose(); }}>Login</button>
          </>
        )}
      </div>

      {/* Mobile menu toggle button */}
      <span
        className={`menu-icon ${menuOpen ? 'open' : ''}`}
        onClick={toggleMenu}
      >
        {menuOpen ? '✖' : '☰'}
      </span>

      {/* Mobile navigation menu */}
      <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={handleMenuClose}>Home</Link>
        {user && (
          <>
            {/* Mobile menu links for logged in users */}
            <Link to="/account" className={`nav-link ${isActive('/account') ? 'active' : ''}`} onClick={handleMenuClose}>Account</Link>
            <Link to="/borrow" className={`nav-link ${isActive('/borrow') ? 'active' : ''}`} onClick={handleMenuClose}>Borrow</Link>
            {user.staff && (
              /* Mobile librarian link for staff */
              <Link to="/librarian" className={`nav-link librarian ${isActive('/librarian') ? 'active' : ''}`} onClick={handleMenuClose}>Librarian</Link>
            )}
            {user.superuser && user.staff && (
              /* Mobile admin link for superuser staff */
              <a href="http://127.0.0.1:8080/admin/" 
                 className={`nav-link admin ${isActive('/admin') ? 'active' : ''}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 onClick={handleMenuClose}>
                Admin
              </a>
            )}
          </>
        )}
        {user ? (
          /* Mobile logout button */
          <button onClick={() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('user');
            setUser(null);
            delete axiosInstance.defaults.headers.common['Authorization'];
            window.location.href = '/';
            handleMenuClose();
          }}>Logout</button>
        ) : (
          <>
            {/* Mobile register and login buttons */}
            <button onClick={() => { setShowRegisterModal(true); handleMenuClose(); }}>Register</button>
            <button onClick={() => { setShowLoginModal(true); handleMenuClose(); }}>Login</button>
          </>
        )}
      </div>

      {/* Login modal */}
      {showLoginModal && (
        <div className="modal">
          <div className="modal-content">
            {/* Modal close button */}
            <span className="close" onClick={() => {
              setShowLoginModal(false);
              setShowForgotPassword(false);
              setShowResendVerification(false);
              setResendMessage('');
              setResetMessage('');
              setLoginErrorMessage('');
              setIsUserInactive(false);
              toggleBodyOverflow(false);
            }}>&times;</span>
            <div className="login-modal-body">
              {/* Login form image */}
              <img src={LoginImage} alt="Login" className="login-image" />
              <div className="login-form">
                {!showForgotPassword && !showResendVerification ? (
                  <>
                    {/* Main login form */}
                    <h2>Login</h2>
                    {loginErrorMessage && (
                      <p style={{ color: isUserInactive ? '#FFBB38' : 'red' }}>
                        {loginErrorMessage}
                      </p>
                    )}
                    {isUserInactive && (
                      <p style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => setShowResendVerification(true)}>
                        Resend verification email?
                      </p>
                    )}
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={handleInputChange(setUsername)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={handleInputChange(setPassword)}
                    />
                    <button onClick={handleLogin}>Login</button>
                    <p style={{ cursor: 'pointer', color: '#007bff' }} 
                       onClick={() => setShowForgotPassword(true)}>
                      Forgot Password?
                    </p>
                  </>
                ) : showForgotPassword ? (
                  <>
                    {/* Forgot password form */}
                    <h2>Forgot Password</h2>
                    {resetMessage && <p>{resetMessage}</p>}
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    <button onClick={handleForgotPassword}>Reset Password</button>
                    <p style={{ cursor: 'pointer', color: '#007bff' }}
                       onClick={() => {
                         setShowForgotPassword(false);
                         setResetMessage('');
                       }}>
                      Back to Login
                    </p>
                  </>
                ) : (
                  <>
                    {/* Resend verification email form */}
                    <h2>Resend Verification Email</h2>
                    {resendMessage && <p>{resendMessage}</p>}
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                    />
                    <button onClick={handleResendVerification}>Resend Verification</button>
                    <p style={{ cursor: 'pointer', color: '#007bff' }}
                       onClick={() => {
                         setShowResendVerification(false);
                         setResendMessage('');
                       }}>
                      Back to Login
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading and Register modals */}
      <LoadingModal show={isLoading} />
      <RegisterModal show={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
    </nav>
  );
};

export default Navbar;