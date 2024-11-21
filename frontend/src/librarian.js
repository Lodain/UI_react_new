import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';

function Librarian() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
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

  useEffect(() => {
    fetchBorrowedBooks();
    fetchAuthorsAndGenres();
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

  const handleAddBook = async (e) => {
    e.preventDefault();
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

      <button onClick={() => setShowAddBook(!showAddBook)}>
        {showAddBook ? 'Hide Add Book Form' : 'Add New Book'}
      </button>

      {showAddBook && (
        <form onSubmit={handleAddBook}>
          <div>
            <label>ISBN:</label>
            <input
              type="text"
              value={newBook.isbn}
              onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={newBook.title}
              onChange={(e) => setNewBook({...newBook, title: e.target.value})}
              required
            />
          </div>

          <div>
            <label>Authors:</label>
            <div>
              {newBook.authors.map((author, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <select
                    value={author}
                    onChange={(e) => handleFieldChange('authors', index, e.target.value)}
                    style={{ width: '200px' }}
                  >
                    <option value="">Select or type new author</option>
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
                    placeholder="Or type new author name"
                    style={{ marginLeft: '10px' }}
                  />
                  <button type="button" onClick={() => removeField('authors', index)} style={{ marginLeft: '10px' }}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addField('authors')}>
                Add Another Author
              </button>
            </div>
          </div>

          <div>
            <label>Genres:</label>
            <div>
              {newBook.genres.map((genre, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <select
                    value={genre}
                    onChange={(e) => handleFieldChange('genres', index, e.target.value)}
                    style={{ width: '200px' }}
                  >
                    <option value="">Select or type new genre</option>
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
                    placeholder="Or type new genre name"
                    style={{ marginLeft: '10px' }}
                  />
                  <button type="button" onClick={() => removeField('genres', index)} style={{ marginLeft: '10px' }}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addField('genres')}>
                Add Another Genre
              </button>
            </div>
          </div>

          <div>
            <label>Copies:</label>
            <input
              type="number"
              value={newBook.copies}
              onChange={(e) => setNewBook({...newBook, copies: parseInt(e.target.value)})}
              min="1"
              required
            />
          </div>

          <div>
            <label>Year:</label>
            <input
              type="number"
              value={newBook.year}
              onChange={(e) => setNewBook({...newBook, year: parseInt(e.target.value)})}
              min="1000"
              max={new Date().getFullYear()}
              required
            />
          </div>

          <div>
            <label>Cover Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewBook({...newBook, cover: e.target.files[0]})}
            />
          </div>

          <button type="submit">Add Book</button>
        </form>
      )}
    </div>
  );
}

export default Librarian;