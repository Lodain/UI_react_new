import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import './style/librarian.css';
import LoadingModal from './component/LoadingModal';

function Librarian() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newBook, setNewBook] = useState({
    isbn: '',
    title: '',
    authors: [''],
    genres: [''],
    copies: 1,
    year: new Date().getFullYear(),
    cover: null
  });
  const [availableAuthors, setAvailableAuthors] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [isReturning, setIsReturning] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);

  useEffect(() => {
    fetchBorrowedBooks();
    fetchAuthorsAndGenres();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      const timeoutId = setTimeout(() => {
        axiosInstance.get(`/search_borrowed_books/?query=${searchQuery}`)
          .then(response => {
            const formattedBooks = response.data.map(book => ({
              ...book,
              return_on: book.return_on || 'N/A',
              borrowed_on: book.borrowed_on || 'N/A'
            }));
            setBorrowedBooks(formattedBooks);
          })
          .catch(error => {
            console.error('Error searching books:', error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      fetchBorrowedBooks();
    }
  }, [searchQuery]);

  useEffect(() => {
    let timeoutId;
    if (message && !message.includes('error')) {
      timeoutId = setTimeout(() => {
        setMessage('');
      }, 10000);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [message]);

  const fetchBorrowedBooks = () => {
    setIsLoading(true);
    axiosInstance.get('/get_borrowed_books/')
      .then(response => {
        const formattedBooks = response.data.map(book => ({
          ...book,
          return_on: book.return_on || 'N/A',
          borrowed_on: book.borrowed_on || 'N/A'
        }));
        setBorrowedBooks(formattedBooks);
      })
      .catch(error => {
        console.error('Error fetching borrowed books:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchAuthorsAndGenres = () => {
    axiosInstance.get('/get_authors_api/')
      .then(response => {
        setAvailableAuthors(response.data);
      })
      .catch(error => {
        console.error('Error fetching authors:', error);
      });

    axiosInstance.get('/get_genres_api/')
      .then(response => {
        setAvailableGenres(response.data);
      })
      .catch(error => {
        console.error('Error fetching genres:', error);
      });
  };

  const handleReturn = (bookId, username, quantity) => {
    setIsReturning(true);
    axiosInstance.post('/return_book_api/', {
      book_id: bookId,
      username: username,
      quantity: quantity
    })
      .then(response => {
        setMessage(response.data.message);
        setSearchQuery('');
        fetchBorrowedBooks();
      })
      .catch(error => {
        setMessage(error.response?.data?.error || 'An error occurred');
      })
      .finally(() => {
        setIsReturning(false);
      });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setIsAddingBook(true);
    const formData = new FormData();
    
    // Add basic book info
    formData.append('isbn', newBook.isbn);
    formData.append('title', newBook.title);
    formData.append('copies', newBook.copies);
    formData.append('year', newBook.year);
    
    // Add arrays as JSON strings
    const nonEmptyAuthors = newBook.authors.filter(author => author.trim());
    const nonEmptyGenres = newBook.genres.filter(genre => genre.trim());
    
    formData.append('authors', JSON.stringify(nonEmptyAuthors));
    formData.append('genres', JSON.stringify(nonEmptyGenres));
    
    // Add cover if exists
    if (newBook.cover) {
      formData.append('cover', newBook.cover);
    }

    try {
      const response = await axiosInstance.post('/add_book_api/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Server Response:', response.data);
      setMessage(response.data.message);
      setShowAddBook(false);
      setNewBook({
        isbn: '',
        title: '',
        authors: [''],
        genres: [''],
        copies: 1,
        year: new Date().getFullYear(),
        cover: null
      });
    } catch (error) {
      console.error('Error Response:', error.response?.data);
      setMessage(error.response?.data?.error || 'Error adding book');
    } finally {
      setIsAddingBook(false);
    }
  };

  const addField = (field) => {
    setNewBook({
      ...newBook,
      [field]: [...newBook[field], '']
    });
  };

  const removeField = (field, index) => {
    const newFields = [...newBook[field]];
    newFields.splice(index, 1);
    setNewBook({
      ...newBook,
      [field]: newFields
    });
  };

  const handleFieldChange = (field, index, value) => {
    const newFields = [...newBook[field]];
    newFields[index] = value;
    setNewBook({
      ...newBook,
      [field]: newFields
    });
  };

  const SkeletonRow = () => (
    <tr className="skeleton-row">
      <td><div className="skeleton-cell"></div></td>
      <td><div className="skeleton-cell"></div></td>
      <td><div className="skeleton-cell"></div></td>
      <td><div className="skeleton-cell"></div></td>
      <td><div className="skeleton-cell"></div></td>
      <td><div className="skeleton-cell"></div></td>
      <td><div className="skeleton-cell"></div></td>
    </tr>
  );

  const isOverdue = (dateString) => {
    if (dateString === 'N/A') return false;
    const returnDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return returnDate < today;
  };

  return (
    <div className="librarian-container">
      <LoadingModal show={isReturning || isAddingBook} />
      
      <h1 className="dashboard-title">Librarian Dashboard</h1>
      
      <div className="top-controls">
        <button 
          onClick={() => setShowAddBook(!showAddBook)} 
          className="toggle-form-button"
        >
          {showAddBook ? 'Hide Add Book Form' : 'Add New Book'}
        </button>
      </div>

      {message && <div className={`message ${message.includes('error') ? 'error' : 'success'}`}>{message}</div>}
      
      {showAddBook && (
        <form onSubmit={handleAddBook} className="add-book-form">
          <div className="form-group">
            <label>ISBN:</label>
            <input
              type="text"
              value={newBook.isbn}
              onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={newBook.title}
              onChange={(e) => setNewBook({...newBook, title: e.target.value})}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Authors:</label>
            <div className="dynamic-fields">
              {newBook.authors.map((author, index) => (
                <div key={index} className="field-row">
                  <select
                    value={author}
                    onChange={(e) => handleFieldChange('authors', index, e.target.value)}
                    className="field-select"
                  >
                    <option value="">Select author</option>
                    {availableAuthors.map((existingAuthor) => (
                      <option key={existingAuthor} value={existingAuthor}>
                        {existingAuthor}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => handleFieldChange('authors', index, e.target.value)}
                    placeholder="Type author name"
                    className="field-input"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeField('authors', index)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => addField('authors')}
                className="add-button"
              >
                Add Another Author
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Genres:</label>
            <div className="dynamic-fields">
              {newBook.genres.map((genre, index) => (
                <div key={index} className="field-row">
                  <select
                    value={genre}
                    onChange={(e) => handleFieldChange('genres', index, e.target.value)}
                    className="field-select"
                  >
                    <option value="">Select genre</option>
                    {availableGenres.map((existingGenre) => (
                      <option key={existingGenre} value={existingGenre}>
                        {existingGenre}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => handleFieldChange('genres', index, e.target.value)}
                    placeholder="Type genre name"
                    className="field-input"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeField('genres', index)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => addField('genres')}
                className="add-button"
              >
                Add Another Genre
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Copies:</label>
            <input
              type="number"
              value={newBook.copies}
              onChange={(e) => setNewBook({...newBook, copies: parseInt(e.target.value)})}
              min="1"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Year:</label>
            <input
              type="number"
              value={newBook.year}
              onChange={(e) => setNewBook({...newBook, year: parseInt(e.target.value)})}
              min="1000"
              max={new Date().getFullYear()}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Cover Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewBook({...newBook, cover: e.target.files[0]})}
              className="form-input"
            />
          </div>

          <button type="submit" className="submit-button">Add Book</button>
        </form>
      )}

      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username, book title, or ISBN"
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="books-table">
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
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : (
              borrowedBooks.map((book, index) => {
                const isBookOverdue = isOverdue(book.return_on);
                return (
                  <tr key={index} className={isBookOverdue ? 'overdue-row' : ''}>
                    <td>{book.title}</td>
                    <td>{book.authors.join(', ')}</td>
                    <td>{book.borrowed_by}</td>
                    <td>{book.number}</td>
                    <td>{book.borrowed_on}</td>
                    <td className={isBookOverdue ? 'overdue-date' : ''}>
                      {book.return_on}
                    </td>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Librarian;