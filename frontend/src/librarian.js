import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import './style/librarian.css';
import LoadingModal from './component/LoadingModal';

function Librarian() {
  // State variables to manage the component's data and UI states
  const [borrowedBooks, setBorrowedBooks] = useState([]); // List of borrowed books
  const [searchQuery, setSearchQuery] = useState(''); // Search input value
  const [message, setMessage] = useState(''); // Feedback message for user actions
  const [showAddBook, setShowAddBook] = useState(false); // Toggle for add book form visibility
  const [isLoading, setIsLoading] = useState(true); // Loading state for data fetching
  const [newBook, setNewBook] = useState({ // State for new book details
    isbn: '',
    title: '',
    authors: [''], // Array to hold multiple authors
    genres: [''], // Array to hold multiple genres
    copies: 1,
    year: new Date().getFullYear(),
    cover: null
  });
  const [availableAuthors, setAvailableAuthors] = useState([]); // List of authors from API
  const [availableGenres, setAvailableGenres] = useState([]); // List of genres from API
  const [isReturning, setIsReturning] = useState(false); // State for book return process
  const [isAddingBook, setIsAddingBook] = useState(false); // State for adding book process

  // Effect to scroll to the top of the page when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Effect to fetch borrowed books and available authors/genres when the component mounts
  useEffect(() => {
    fetchBorrowedBooks(); // Fetch list of borrowed books
    fetchAuthorsAndGenres(); // Fetch available authors and genres
  }, []);

  // Effect to handle search functionality when the search query changes
  useEffect(() => {
    if (searchQuery.trim()) { // Check if search query is not empty
      setIsLoading(true); // Set loading state to true
      const timeoutId = setTimeout(() => { // Debounce search to avoid excessive API calls
        axiosInstance.get(`/search_borrowed_books/?query=${searchQuery}`)
          .then(response => {
            // Format the response data to include default values for missing dates
            const formattedBooks = response.data.map(book => ({
              ...book,
              return_on: book.return_on || 'N/A',
              borrowed_on: book.borrowed_on || 'N/A'
            }));
            setBorrowedBooks(formattedBooks); // Update state with formatted books
          })
          .catch(error => {
            console.error('Error searching books:', error); // Log any errors
          })
          .finally(() => {
            setIsLoading(false); // Set loading state to false
          });
      }, 300); // 300ms debounce delay

      return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount
    } else {
      fetchBorrowedBooks(); // Fetch all borrowed books if search query is empty
    }
  }, [searchQuery]);

  // Effect to clear the message after 10 seconds if it's not an error
  useEffect(() => {
    let timeoutId;
    if (message && !message.includes('error')) { // Check if message is not an error
      timeoutId = setTimeout(() => {
        setMessage(''); // Clear message after 10 seconds
      }, 10000);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId); // Cleanup timeout on component unmount
      }
    };
  }, [message]);

  // Function to fetch borrowed books from the server
  const fetchBorrowedBooks = () => {
    setIsLoading(true); // Set loading state to true
    axiosInstance.get('/get_borrowed_books/')
      .then(response => {
        // Format the response data to include default values for missing dates
        const formattedBooks = response.data.map(book => ({
          ...book,
          return_on: book.return_on || 'N/A',
          borrowed_on: book.borrowed_on || 'N/A'
        }));
        setBorrowedBooks(formattedBooks); // Update state with formatted books
      })
      .catch(error => {
        console.error('Error fetching borrowed books:', error); // Log any errors
      })
      .finally(() => {
        setIsLoading(false); // Set loading state to false
      });
  };

  // Function to fetch available authors and genres from the server
  const fetchAuthorsAndGenres = () => {
    axiosInstance.get('/get_authors_api/')
      .then(response => {
        setAvailableAuthors(response.data); // Update state with authors
      })
      .catch(error => {
        console.error('Error fetching authors:', error); // Log any errors
      });

    axiosInstance.get('/get_genres_api/')
      .then(response => {
        setAvailableGenres(response.data); // Update state with genres
      })
      .catch(error => {
        console.error('Error fetching genres:', error); // Log any errors
      });
  };

  // Function to handle the return of a book
  const handleReturn = (bookId, username, quantity) => {
    setIsReturning(true); // Set returning state to true
    axiosInstance.post('/return_book_api/', {
      book_id: bookId,
      username: username,
      quantity: quantity
    })
      .then(response => {
        setMessage(response.data.message); // Set success message
        setSearchQuery(''); // Clear search query
        fetchBorrowedBooks(); // Refresh borrowed books list
      })
      .catch(error => {
        setMessage(error.response?.data?.error || 'An error occurred'); // Set error message
      })
      .finally(() => {
        setIsReturning(false); // Set returning state to false
      });
  };

  // Function to handle adding a new book
  const handleAddBook = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setIsAddingBook(true); // Set adding book state to true
    const formData = new FormData(); // Create a new FormData object
    
    // Append basic book info to formData
    formData.append('isbn', newBook.isbn);
    formData.append('title', newBook.title);
    formData.append('copies', newBook.copies);
    formData.append('year', newBook.year);
    
    // Filter out empty authors and genres and append them as JSON strings
    const nonEmptyAuthors = newBook.authors.filter(author => author.trim());
    const nonEmptyGenres = newBook.genres.filter(genre => genre.trim());
    
    formData.append('authors', JSON.stringify(nonEmptyAuthors));
    formData.append('genres', JSON.stringify(nonEmptyGenres));
    
    // Append cover image if it exists
    if (newBook.cover) {
      formData.append('cover', newBook.cover);
    }

    try {
      const response = await axiosInstance.post('/add_book_api/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Server Response:', response.data); // Log server response
      setMessage(response.data.message); // Set success message
      setShowAddBook(false); // Hide add book form
      // Reset new book state to initial values
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
      console.error('Error Response:', error.response?.data); // Log error response
      setMessage(error.response?.data?.error || 'Error adding book'); // Set error message
    } finally {
      setIsAddingBook(false); // Set adding book state to false
    }
  };

  // Function to add a new field for authors or genres
  const addField = (field) => {
    setNewBook({
      ...newBook,
      [field]: [...newBook[field], ''] // Add an empty string to the specified field array
    });
  };

  // Function to remove a field for authors or genres
  const removeField = (field, index) => {
    const newFields = [...newBook[field]]; // Copy the current field array
    newFields.splice(index, 1); // Remove the field at the specified index
    setNewBook({
      ...newBook,
      [field]: newFields // Update the state with the modified array
    });
  };

  // Function to handle changes in author or genre fields
  const handleFieldChange = (field, index, value) => {
    const newFields = [...newBook[field]]; // Copy the current field array
    newFields[index] = value; // Update the field at the specified index
    setNewBook({
      ...newBook,
      [field]: newFields // Update the state with the modified array
    });
  };

  // Component to render a skeleton row for loading state
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

  // Function to check if a book is overdue
  const isOverdue = (dateString) => {
    if (dateString === 'N/A') return false; // Return false if date is not available
    const returnDate = new Date(dateString); // Convert date string to Date object
    const today = new Date(); // Get today's date
    today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
    return returnDate < today; // Return true if return date is before today
  };

  return (
    <div className="librarian-container">
      <LoadingModal show={isReturning || isAddingBook} /> {/* Show loading modal if returning or adding book */}
      
      <h1 className="dashboard-title">Librarian Dashboard</h1> {/* Dashboard title */}
      
      <div className="top-controls">
        <button 
          onClick={() => setShowAddBook(!showAddBook)} 
          className="toggle-form-button"
        >
          {showAddBook ? 'Hide Add Book Form' : 'Add New Book'} {/* Toggle button text */}
        </button>
      </div>

      {message && <div className={`message ${message.includes('error') ? 'error' : 'success'}`}>{message}</div>} {/* Display message */}

      {showAddBook && ( // Conditional rendering of add book form
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
            {isLoading ? ( // Render skeleton rows if data is loading
              [...Array(5)].map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : (
              borrowedBooks.map((book, index) => {
                const isBookOverdue = isOverdue(book.return_on); // Check if book is overdue
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