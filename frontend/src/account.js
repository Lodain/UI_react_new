import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';

function Account() {
  const [user, setUser] = useState(null);
  const [lendedBooks, setLendedBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);

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

  return (
    <div>
      <h1>Account Information</h1>
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
    </div>
  );
}

export default Account;