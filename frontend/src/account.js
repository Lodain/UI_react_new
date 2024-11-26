import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';

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
      const response = await axiosInstance.post('/change-password-api/', {
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

      // Clear session storage and redirect to home
      sessionStorage.clear();
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    }
  };

  return (
    <div>
      <h1>Account Information</h1>
      
      {success && (
        <div 
          style={{ 
            color: 'green', 
            backgroundColor: '#e8f5e9',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #c8e6c9'
          }}
        >
          {success}
        </div>
      )}

      {error && (
        <div 
          style={{ 
            color: '#721c24', 
            backgroundColor: '#f8d7da',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}
        >
          {error}
        </div>
      )}

      {user && (
        <div>
          <p><b>Name:</b> {user.first_name}</p>
          <p><b>Surname:</b> {user.last_name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Username:</b> {user.username}</p>
        </div>
      )}

      <h2>Lended Books</h2>
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

      <div>
        <button 
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          style={{
            padding: '10px 20px',
            margin: '20px 0',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showPasswordForm ? 'Cancel' : 'Change Password'}
        </button>
      </div>

      {showPasswordForm && (
        <form onSubmit={handlePasswordChange} style={{ maxWidth: '300px', margin: '20px 0' }}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="Current Password"
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '5px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '5px',
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
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '5px',
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
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Update Password
          </button>
        </form>
      )}

      {!showPasswordForm && (
        <div>
          <button 
            onClick={() => setShowDeleteForm(!showDeleteForm)}
            style={{
              padding: '10px 20px',
              margin: '20px 0',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showDeleteForm ? 'Cancel' : 'Delete Account'}
          </button>
        </div>
      )}

      {showDeleteForm && (
        <form onSubmit={handleDeleteAccount} style={{ maxWidth: '300px', margin: '20px 0' }}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Confirm Username"
              value={deleteData.username}
              onChange={(e) => setDeleteData({...deleteData, username: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '5px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={deleteData.password}
              onChange={(e) => setDeleteData({...deleteData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '5px',
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
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Confirm Delete Account
          </button>
        </form>
      )}
    </div>
  );
}

export default Account;