import React, { useState } from 'react';
import axiosInstance from './axiosConfig';
import Navbar from './Navbar';

const Borrow = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState('');

  const searchBooks = () => {
    axiosInstance.get(`borrow_book?query=${query}`)
      .then(response => {
        setBooks(response.data);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
      });
  };

  const borrowBook = (isbn) => {
    axiosInstance.post('borrow_book/', { book_id: isbn })
      .then(response => {
        setMessage(response.data.message);
        searchBooks(); // Refresh the book list
      })
      .catch(error => {
        setMessage(error.response.data.error);
      });
  };

  return (
    <div>
      <Navbar />
      <h2>Search and Borrow a Book</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, author, or ISBN"
      />
      <button onClick={searchBooks}>Search</button>
      {message && <p>{message}</p>}
      <ul>
        {books.map((book, index) => (
          <li key={index}>
            <h3>{book.title}</h3>
            <p>Authors: {book.authors.join(', ')}</p>
            <p>ISBN: {book.isbn}</p>
            <p>Copies: {book.copies}</p>
            <p>Lended: {book.lended}</p>
            <button onClick={() => borrowBook(book.isbn)}>Borrow this book</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Borrow;