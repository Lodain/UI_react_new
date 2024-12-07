import React, { useState, useCallback, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import '../style/Borrow.css';
import { Card, CardMedia, CardContent, Typography, Skeleton } from '@mui/material';
import LoadingModal from './LoadingModal';
import { useNavigate } from 'react-router-dom';

// Modal component to show success message when a book is borrowed
const SuccessModal = ({ book, onClose, onGoToAccount }) => {
  if (!book) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Book Borrowed Successfully!</h3>
        </div>
        <div className="modal-body">
          <img 
            src={`http://127.0.0.1:8080${book.cover}`} 
            alt={book.title}
            className="modal-book-cover"
          />
          <p className="modal-book-title">{book.title}</p>
          <p>The book has been added to your borrowed books.</p>
        </div>
        <div className="modal-footer">
          <button 
            onClick={onClose}
            className="modal-close-button"
          >
            Close
          </button>
          <button 
            onClick={onGoToAccount}
            className="modal-account-button"
          >
            Go to My Account
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component for borrowing books
const Borrow = () => {
  const [query, setQuery] = useState(''); // State for search query
  const [books, setBooks] = useState([]); // State for list of books
  const [message, setMessage] = useState(''); // State for messages
  const [isLoading, setIsLoading] = useState(false); // State for loading status
  const [borrowedBook, setBorrowedBook] = useState(null); // State for borrowed book
  const [isBorrowing, setIsBorrowing] = useState(false); // State for borrowing status
  const navigate = useNavigate(); // Hook for navigation

  // Effect to scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to search books based on query
  const searchBooks = useCallback(() => {
    axiosInstance.get(`borrow_book_api?query=${query}`)
      .then(response => {
        setBooks(response.data);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [query]);

  // Effect to handle debounced search
  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query) {
        setIsLoading(true);
        searchBooks();
      } else {
        setBooks([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, searchBooks]);

  // Component to show loading skeletons
  const LoadingSkeleton = () => (
    <div className="card-container">
      <Card sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Skeleton 
          variant="rectangular" 
          sx={{
            height: 300,
            padding: '10px',
          }}
          animation="wave"
        />
        <CardContent sx={{ 
          padding: '4px',
          flexGrow: 1,
          backgroundColor: '#394e75',
          '&:last-child': { 
            paddingBottom: '4px'
          }
        }}>
          <Skeleton 
            variant="text" 
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} 
            width="80%" 
          />
          <Skeleton 
            variant="text" 
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} 
            width="40%" 
          />
          <Skeleton 
            variant="rectangular" 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              height: '32px',
              borderRadius: '4px',
              mt: 1
            }} 
          />
        </CardContent>
      </Card>
    </div>
  );

  // Function to handle borrowing a book
  const borrowBook = (isbn) => {
    const book = books.find(b => b.isbn === isbn);
    setIsBorrowing(true);
    axiosInstance.post('borrow_book_api', { book_id: isbn })
      .then(response => {
        setMessage(response.data.message);
        setBorrowedBook(book);
      })
      .catch(error => {
        setMessage(error.response.data.error);
      })
      .finally(() => {
        setIsBorrowing(false);
      });
  };

  // Function to close the success modal
  const handleCloseModal = () => {
    setBorrowedBook(null);
    searchBooks();
  };

  // Function to navigate to the account page
  const handleGoToAccount = () => {
    navigate('/account');
  };

  return (
    <div>
      <LoadingModal show={isBorrowing} />
      <h2>Search and Borrow a Book</h2>
      <input
        className="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, author, genre, or ISBN"
      />
      {message && <p>{message}</p>}
      <div className={`book-list ${(books.length > 0 || isLoading) ? 'visible' : ''}`} align="center">
        {isLoading ? (
          // Show 4 skeleton cards while loading
          Array(4).fill(0).map((_, index) => (
            <LoadingSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          books.map((book, index) => (
            <div className="card-container" key={index}>
              <Card sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <CardMedia
                  className="card-media"
                  component="img"
                  image={`http://127.0.0.1:8080${book.cover}`}
                  alt={book.title}
                  sx={{
                    padding: '10px',
                    objectFit: 'contain',
                    height: 300,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/book/${book.isbn}`)}
                />
                <CardContent sx={{ 
                  padding: '4px',
                  flexGrow: 1,
                  backgroundColor: '#394e75',
                  color: 'white',
                  '&:last-child': { 
                    paddingBottom: '4px'
                  }
                }}>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div"
                    className="card-title"
                    sx={{ 
                      color: 'white',
                      fontSize: '0.9rem',
                      lineHeight: '1.2',
                      marginBottom: '4px'
                    }}
                  >
                    {book.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#e0e0e0', 
                      mb: 0.5
                    }}
                  >
                    Available: {book.copies - book.lended} of {book.copies} {/* Display available copies */}
                  </Typography>
                  <button 
                    onClick={() => borrowBook(book.isbn)}
                    className={`borrow-button ${book.copies - book.lended === 0 ? 'disabled' : ''}`}
                    disabled={book.copies - book.lended === 0} //disable borrow button if no copies are available
                  >
                    Borrow this book
                  </button>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
      {borrowedBook && (
        <SuccessModal 
          book={borrowedBook}
          onClose={handleCloseModal}
          onGoToAccount={handleGoToAccount}
        />
      )}
    </div>
  );
};

export default Borrow;