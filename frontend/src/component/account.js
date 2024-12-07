import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import '../style/account.css';
import AccountImage from '../img/Account.png';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import LoadingModal from './LoadingModal';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

/* Main Account component */
function Account() {
  // State variables for user data, UI states, and form data
  const [user, setUser] = useState(null);
  const [lendedBooks, setLendedBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteData, setDeleteData] = useState({
    username: '',
    password: ''
  });
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to toggle the sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to close the sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Effect to scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Effect to fetch user data and lists on component mount
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    axiosInstance.get('/lended-books/')
      .then(res => {
        setLendedBooks(res.data);
      })
      .catch(err => {
        console.error('Error fetching lended books:', err);
      });

    axiosInstance.get('/wishlist/')
      .then(res => {
        setWishlist(res.data);
      })
      .catch(err => {
        console.error('Error fetching wishlist:', err);
      });
  }, []);

  // Effect to clear error messages after 5 seconds
  useEffect(() => {
    let timeoutId;
    if (error) {
      timeoutId = setTimeout(() => {
        setError('');
      }, 5000);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [error]);

  // Effect to clear success messages after 5 seconds
  useEffect(() => {
    let timeoutId;
    if (success) {
      timeoutId = setTimeout(() => {
        setSuccess('');
      }, 5000);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [success]);

  // Function to handle password change form submission
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/change-password-api/', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle account deletion form submission
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await axiosInstance.post('/delete-account-api/', {
        username: deleteData.username,
        password: deleteData.password
      });

      setShowDeleteSuccessModal(true);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete account';
      setError(errorMessage);
      
      if (errorMessage.includes('borrowed books')) {
        setActiveTab('borrowed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render content based on the active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'account':
        return (
          <div>
            {user && (
              <div>
                <p><b>Name:</b> {user.first_name}</p>
                <p><b>Surname:</b> {user.last_name}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Username:</b> {user.username}</p>
              </div>
            )}

            <div>
              <button 
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  closeSidebar();
                }}
                className={`button change-password-button`}
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordForm && (
              <div className="form-container">
                <form onSubmit={handlePasswordChange} style={{ maxWidth: '300px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwordData.oldPassword}
                      onChange={(e) => {
                        setError('');
                        setPasswordData({...passwordData, oldPassword: e.target.value});
                      }}
                      className="input-field"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setError('');
                        setPasswordData({...passwordData, newPassword: e.target.value});
                      }}
                      className="input-field"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setError('');
                        setPasswordData({...passwordData, confirmPassword: e.target.value});
                      }}
                      className="input-field"
                      required
                    />
                  </div>
                  <button type="submit" className="update-password-button">
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {!showPasswordForm && (
              <div>
                <button 
                  onClick={() => {
                    setShowDeleteForm(!showDeleteForm);
                    closeSidebar();
                  }}
                  className={`button delete-account-button`}
                >
                  {showDeleteForm ? 'Cancel' : 'Delete Account'}
                </button>
              </div>
            )}

            {showDeleteForm && (
              <div className="form-container">
                <form onSubmit={handleDeleteAccount} style={{ maxWidth: '300px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <input
                      type="text"
                      placeholder="Confirm Username"
                      value={deleteData.username}
                      onChange={(e) => {
                        setError('');
                        setDeleteData({...deleteData, username: e.target.value});
                      }}
                      className="input-field"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={deleteData.password}
                      onChange={(e) => {
                        setError('');
                        setDeleteData({...deleteData, password: e.target.value});
                      }}
                      className="input-field"
                      required
                    />
                  </div>
                  <button type="submit" className="delete-account-button">
                    Delete Account
                  </button>
                </form>
              </div>
            )}
          </div>
        );

      case 'borrowed':
        return (
          <div>
            <div align="center">
              {lendedBooks.length > 0 ? (
                lendedBooks.map((book, index) => (
                  <div className="card-container" key={index}>
                    <Card 
                      sx={{ 
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => window.location.href = `/book/${book.isbn}`}
                    >
                      {book.number > 1 && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1
                        }}>
                          {book.number}
                        </div>
                      )}
                      <CardMedia
                        className="card-media"
                        component="img"
                        image={`http://127.0.0.1:8080${book.cover}`}
                        alt={book.title}
                        sx={{
                          padding: '10px',
                          objectFit: 'contain',
                          height: 300
                        }}
                      />
                      <CardContent sx={{ 
                        padding: '8px', 
                        flexGrow: 1,
                        backgroundColor: '#394e75',
                        color: 'white',
                        '&:last-child': { 
                          paddingBottom: '8px' 
                        }
                      }}>
                        <Typography 
                          gutterBottom 
                          variant="h6" 
                          component="div"
                          className="card-title"
                          sx={{ color: 'white' }}
                        >
                          {book.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          className="card-authors"
                          sx={{ color: '#e0e0e0' }}
                        >
                          Authors: {book.authors.join(', ')}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: '#e0e0e0' }}
                        >
                          Due: {book.return_on}
                          {book.number > 1 && ` (${book.number} copies)`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </div>
                ))
              ) : (
                <p>No borrowed books found.</p>
              )}
            </div>
          </div>
        );

      case 'wishlist':
        return (
          <div>
            <div align="center">
              {wishlist.length > 0 ? (
                wishlist.map((book, index) => (
                  <div className="card-container" key={index}>
                    <Card 
                      sx={{ 
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => window.location.href = `/book/${book.isbn}`}
                    >
                      <CardMedia
                        className="card-media"
                        component="img"
                        image={`http://127.0.0.1:8080${book.cover}`}
                        alt={book.title}
                        sx={{
                          padding: '10px',
                          objectFit: 'contain',
                          height: 300
                        }}
                      />
                      <CardContent sx={{ 
                        padding: '8px', 
                        flexGrow: 1,
                        backgroundColor: '#394e75',
                        color: 'white',
                        '&:last-child': { 
                          paddingBottom: '8px' 
                        }
                      }}>
                        <Typography 
                          gutterBottom 
                          variant="h6" 
                          component="div"
                          className="card-title"
                          sx={{ color: 'white' }}
                        >
                          {book.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          className="card-authors"
                          sx={{ color: '#e0e0e0' }}
                        >
                          Authors: {book.authors.join(', ')}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: '#e0e0e0' }}
                        >
                          ISBN: {book.isbn}
                        </Typography>
                      </CardContent>
                    </Card>
                  </div>
                ))
              ) : (
                <p>No books in wishlist.</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Main return statement for rendering the component
  // Main component return statement
  return (
    <div>
      {/* Loading spinner modal component */}
      <LoadingModal show={isLoading} />

      {/* Mobile menu toggle button that shows/hides sidebar */}
      <div className={`account-menu-icon ${isSidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}>
        <span className="icon">{isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}</span>
      </div>

      {/* Success message banner */}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* Error message banner */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Main account page container */}
      <div className={`account-container ${isSidebarOpen ? 'open' : ''}`}>
        {/* Sidebar navigation menu */}
        <div className={`account-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="account-menu">
            {/* Account info tab button */}
            <button 
              className={`menu-button ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('account');
                closeSidebar();
              }}
            >
              Account Information
            </button>

            {/* Borrowed books tab button */}
            <button 
              className={`menu-button ${activeTab === 'borrowed' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('borrowed');
                closeSidebar();
              }}
            >
              Borrowed Books
            </button>

            {/* Wishlist tab button */}
            <button 
              className={`menu-button ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('wishlist');
                closeSidebar();
              }}
            >
              Wishlist
            </button>
          </div>

          {/* Decorative account image in sidebar */}
          <img src={AccountImage} alt="Account" style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }} />
        </div>

        {/* Main content area */}
        <div className="account-content">
          <div className="content-container">
            {/* Renders content based on selected tab */}
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Account deletion success modal */}
      {showDeleteSuccessModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Account Deleted Successfully</h2>
            <p>Your account has been permanently deleted.</p>
            <button
              onClick={() => {
                // Clear session and redirect to home page
                sessionStorage.clear();
                window.location.href = '/';
              }}
              className="button change-password-button"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;