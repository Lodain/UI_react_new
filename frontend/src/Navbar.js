import './style/Navbar.css';
import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import RegisterModal from './RegisterModal';
import LoadingModal from './component/LoadingModal';

const Navbar = ({ setUser }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUserState] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [isUserInactive, setIsUserInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const storedUser = JSON.parse(sessionStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
        setUserState(storedUser);
      }
    }
  }, [setUser]);

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
            setUserState(userData);
            setShowLoginModal(false);
            setIsLoading(false);
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

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
    setLoginErrorMessage('');
    setIsUserInactive(false);
  };

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

  return (
    <nav className="top-right-buttons">
      <div className="left-buttons">
        <span className="navbar-title">BiblioBase</span>
        <button onClick={() => window.location.href = '/'}>Home</button>
        {user && (
          <>
            <button onClick={() => window.location.href = '/account'}>Account</button>
            <button onClick={() => window.location.href = '/borrow'}>Borrow</button>
            {user.superuser && <button onClick={() => window.location.href = '/librarian'}>Librarian</button>}
            {user.superuser && user.staff && <button onClick={() => window.location.href = 'http://127.0.0.1:8080/admin/'}>Admin</button>}
          </>
        )}
      </div>
      <div className="right-buttons">
        {user ? (
          <button onClick={() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('user');
            setUser(null);
            setUserState(null);
            delete axiosInstance.defaults.headers.common['Authorization'];
            window.location.href = '/';
          }}>Logout</button>
        ) : (
          <>
            <button onClick={() => setShowRegisterModal(true)}>Register</button>
            <button onClick={() => setShowLoginModal(true)}>Login</button>
          </>
        )}
      </div>

      {showLoginModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => {
              setShowLoginModal(false);
              setShowForgotPassword(false);
              setShowResendVerification(false);
              setResendMessage('');
              setResetMessage('');
              setLoginErrorMessage('');
              setIsUserInactive(false);
            }}>&times;</span>
            
            {!showForgotPassword && !showResendVerification ? (
              <>
                <h2>Login</h2>
                {loginErrorMessage && <p style={{ color: 'red' }}>{loginErrorMessage}</p>}
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
      )}

      <LoadingModal show={isLoading} />
      <RegisterModal show={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
    </nav>
  );
};

export default Navbar;