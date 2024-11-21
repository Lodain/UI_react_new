import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';

function Librarian() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = () => {
    axiosInstance.get('/get_borrowed_books/')
      .then(response => {
        setBorrowedBooks(response.data);
      })
      .catch(error => {
        console.error('Error fetching borrowed books:', error);
      });
  };

  const handleSearch = () => {
    axiosInstance.get(`/search_borrowed_books/?query=${searchQuery}`)
      .then(response => {
        setBorrowedBooks(response.data);
      })
      .catch(error => {
        console.error('Error searching books:', error);
      });
  };

  const handleReturn = (bookId, username, quantity) => {
    axiosInstance.post('/return_book_api/', {
      book_id: bookId,
      username: username,
      quantity: quantity
    })
      .then(response => {
        setMessage(response.data.message);
        fetchBorrowedBooks(); // Refresh the list
      })
      .catch(error => {
        setMessage(error.response?.data?.error || 'An error occurred');
      });
  };

  return (
    <div>
      <h1>Librarian Dashboard</h1>
      
      {message && <div className={message.includes('error') ? 'error' : 'success'}>{message}</div>}
      
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username, book title, or ISBN"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Authors</th>
            <th>Borrowed By</th>
            <th>Number</th>
            <th>Borrowed On</th>
            <th>Return On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {borrowedBooks.map((book, index) => (
            <tr key={index}>
              <td>{book.title}</td>
              <td>{book.authors.join(', ')}</td>
              <td>{book.borrowed_by}</td>
              <td>{book.number}</td>
              <td>{book.borrowed_on}</td>
              <td>{book.return_on}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  max={book.number}
                  defaultValue="1"
                  onChange={(e) => book.returnQuantity = e.target.value}
                />
                <button onClick={() => handleReturn(book.isbn, book.borrowed_by, book.returnQuantity || 1)}>
                  Return Book
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Librarian;