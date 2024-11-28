import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import './style/account.css';
import AccountImage from './img/Account.png';

function Account() {
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

  useEffect(() => {
    // Fetch user information from session storage
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    // Fetch lended books
    axiosInstance.get('/lended-books/')
      .then(res => {
        setLendedBooks(res.data);
      })
      .catch(err => {
        console.error('Error fetching lended books:', err);
      });

    // Fetch wishlist
    axiosInstance.get('/wishlist/')
      .then(res => {
        setWishlist(res.data);
      })
      .catch(err => {
        console.error('Error fetching wishlist:', err);
      });
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
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
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/delete-account-api/', {
        username: deleteData.username,
        password: deleteData.password
      });

      setShowDeleteSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    }
  };

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
                onClick={() => setShowPasswordForm(!showPasswordForm)}
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
                      onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
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
                  onClick={() => setShowDeleteForm(!showDeleteForm)}
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
                      onChange={(e) => setDeleteData({...deleteData, username: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={deleteData.password}
                      onChange={(e) => setDeleteData({...deleteData, password: e.target.value})}
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
            <h2>Borrowed Books</h2>
            <ul>
              {lendedBooks.length > 0 ? (
                lendedBooks.map((book, index) => (
                  <li key={index}>
                    <b>Title:</b> {book.title}<br />
                    <b>Authors:</b> {book.authors.join(', ')}<br />
                    <b>ISBN:</b> {book.isbn}<br />
                    <b>Quantity:</b> {book.number}<br />
                    <b>Borrowing Date:</b> {book.borrowed_on}<br />
                    <b>Due Date:</b> {book.return_on}<br />
                  </li>
                ))
              ) : (
                <p>No borrowed books found.</p>
              )}
            </ul>
          </div>
        );

      case 'wishlist':
        return (
          <div>
            <h2>Wishlist</h2>
            <ul>
              {wishlist.length > 0 ? (
                wishlist.map((book, index) => (
                  <li key={index}>
                    <b>Title:</b> {book.title}<br />
                    <b>Authors:</b> {book.authors.join(', ')}<br />
                    <b>ISBN:</b> {book.isbn}<br />
                  </li>
                ))
              ) : (
                <p>No books in wishlist.</p>
              )}
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="account-container">
        <div className="account-sidebar">
          <div className="account-menu">
            <button 
              className={`menu-button ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              Account Information
            </button>
            <button 
              className={`menu-button ${activeTab === 'borrowed' ? 'active' : ''}`}
              onClick={() => setActiveTab('borrowed')}
            >
              Borrowed Books
            </button>
            <button 
              className={`menu-button ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              Wishlist
            </button>
          </div>
          <img src={AccountImage} alt="Account" style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }} />
        </div>

        <div className="account-content">
          <div className="content-container">
            {renderContent()}
          </div>
        </div>
      </div>

      {showDeleteSuccessModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Account Deleted Successfully</h2>
            <p>Your account has been permanently deleted.</p>
            <button
              onClick={() => {
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