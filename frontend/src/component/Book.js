import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { Typography, Rating, Button, Modal, Box } from '@mui/material';
import LoadingModal from './LoadingModal';
import '../style/Book.css';
import { useParams } from 'react-router-dom';

function Book() {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when component mounts
  }, []);

  const { isbn } = useParams(); // Get ISBN from URL parameters
  const [book, setBook] = useState(null); // State to store book details
  const [error, setError] = useState(null); // State to store any errors
  const [user, setUser] = useState(null); // State to store user information
  const [showReviewForm, setShowReviewForm] = useState(false); // State to toggle review form visibility
  const [newReview, setNewReview] = useState({ rating: 0, content: '' }); // State for new review data
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state
  const [responseModal, setResponseModal] = useState({
    open: false,
    message: '',
    isSuccess: false
  }); // State for response modal
  const [isPageLoading, setIsPageLoading] = useState(true); // State for page loading
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480); // State to check if the view is mobile

  useEffect(() => {
    // Check for stored user in session storage
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    // Fetch book details using the ISBN
    fetchBookDetails(isbn);
  }, [isbn]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480); // Update mobile state on window resize
    };

    window.addEventListener('resize', handleResize); // Add resize event listener
    return () => window.removeEventListener('resize', handleResize); // Clean up event listener
  }, []);

  const fetchBookDetails = (isbn) => {
    if (isbn) {
      setIsPageLoading(true); // Set page loading state
      axiosInstance.get(`/book/${isbn}/`)
        .then(response => {
          setBook(response.data); // Set book data from response
        })
        .catch(error => {
          setError(error.response?.data?.error || 'An error occurred'); // Set error message
        })
        .finally(() => {
          setIsPageLoading(false); // Reset page loading state
        });
    }
  };

  const handleBorrow = () => {
    if (book) {
      setIsLoading(true); // Set loading state
      axiosInstance.post('borrow_book_api', { book_id: book.isbn })
        .then(response => {
          setResponseModal({
            open: true,
            message: response.data.message,
            isSuccess: true
          }); // Show success message
          // Reload book data to update available copies
          axiosInstance.get(`/book/${book.isbn}/`)
            .then(response => {
              setBook(response.data); // Update book data
            })
            .catch(error => {
              console.error('Error refreshing book data:', error); // Log error
            });
        })
        .catch(error => {
          setResponseModal({
            open: true,
            message: error.response?.data?.error || 'Error borrowing book',
            isSuccess: false
          }); // Show error message
        })
        .finally(() => {
          setIsLoading(false); // Reset loading state
        });
    }
  };

  const handleCloseResponseModal = () => {
    setResponseModal(prev => ({ ...prev, open: false })); // Close response modal
  };

  const handleWishlist = () => {
    if (book) {
      axiosInstance.post(`/toggle_wishlist/${book.isbn}/`)
        .then(response => {
          setBook({
            ...book,
            in_wishlist: !book.in_wishlist
          }); // Toggle wishlist status
        })
        .catch(error => {
          alert(error.response?.data?.error || 'Error updating wishlist'); // Show error alert
        });
    }
  };

  const handleAddReview = () => {
    setShowReviewForm(true); // Show review form
  };

  const handleReviewSubmit = () => {
    if (book) {
      axiosInstance.post(`/add_review/${book.isbn}/`, newReview)
        .then(response => {
          setBook({
            ...book,
            reviews: [...book.reviews, response.data],
            average_rating: response.data.average_rating
          }); // Add new review and update average rating
          setShowReviewForm(false); // Hide review form
          setNewReview({ rating: 0, content: '' }); // Reset new review state
        })
        .catch(error => {
          alert(error.response?.data?.error || 'Error adding review'); // Show error alert
        });
    }
  };

  const handleDeleteReview = (reviewId) => {
    if (book) {
      axiosInstance.delete(`/delete_review/${book.isbn}/${reviewId}/`)
        .then(response => {
          setBook({
            ...book,
            reviews: book.reviews.filter(review => review.id !== reviewId),
            average_rating: response.data.average_rating
          }); // Remove review and update average rating
        })
        .catch(error => {
          alert(error.response?.data?.error || 'Error deleting review'); // Show error alert
        });
    }
  };

  if (error) return <div>Error: {error}</div>; // Display error message
  if (isPageLoading) return <LoadingModal show={true} />; // Show loading modal
  if (!book) return null; // Return null if no book data

  return (
    <div className="book-container">
      <LoadingModal show={isLoading} /> {/* Show loading modal if loading */}

      <Modal
        open={responseModal.open}
        onClose={handleCloseResponseModal}
        aria-labelledby="borrow-response-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              color: responseModal.isSuccess ? 'success.main' : 'error.main',
              mb: 2
            }}
          >
            {responseModal.isSuccess ? 'Success!' : 'Error'} {/* Display success or error */}
          </Typography>
          <Typography sx={{ mb: 2 }}>
            {responseModal.message} {/* Display response message */}
          </Typography>
          <Button 
            onClick={handleCloseResponseModal}
            variant="contained"
            sx={{ 
              backgroundColor: '#394e75',
              '&:hover': { backgroundColor: '#2c3c59' }
            }}
          >
            Close {/* Close button */}
          </Button>
        </Box>
      </Modal>

      <div className="book-cover-section">
        {book.cover && (
          <img
            src={`http://127.0.0.1:8080${book.cover}`}
            alt={book.title}
          /> // Display book cover image
        )}
        
        {user && (
          <div className="book-actions">
            <Button 
              variant="contained" 
              fullWidth
              sx={{ 
                mb: 1, 
                backgroundColor: '#394e75', 
                '&:hover': { backgroundColor: '#2c3c59' },
                height: { xs: '32px', sm: '36px', md: '52px' },  // Further reduced height
                fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.9rem' }  // Further reduced font size
              }}
              onClick={handleBorrow}
              disabled={book.copies <= book.lended} // Disable if no copies available
            >
              Borrow {/* Borrow button */}
            </Button>
            <Button 
              variant="outlined"
              fullWidth
              sx={{ 
                color: '#394e75', 
                borderColor: '#394e75',
                '&:hover': { 
                  borderColor: '#2c3c59',
                  backgroundColor: 'rgba(57, 78, 117, 0.04)'
                },
                height: { xs: '32px', sm: '36px', md: '52px' },  
                fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.9rem' }  
              }}
              onClick={handleWishlist}
            >
              {book.in_wishlist ? 'Remove from Wishlist' : 'Add to Wishlist'} {/* Wishlist toggle */}
            </Button>
          </div>
        )}
      </div>

      <div className="book-details-section">
        <Typography variant="h4" gutterBottom>
          {book.title} {/* Display book title */}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          by {book.authors.join(', ')} {/* Display book authors */}
        </Typography>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Rating value={book.average_rating} readOnly precision={0.5} /> {/* Display average rating */}
          <Typography variant="body2" color="text.secondary">
            {book.average_rating.toFixed(1)} · {book.reviews.length} ratings {/* Display rating count */}
          </Typography>
        </div>

        {/* Book details */}
        <Typography variant="body2" color="text.secondary" paragraph>
          ISBN: {book.isbn} · Published {book.year} · {book.copies - book.lended} available copies {/* Display book details */}
        </Typography>

        {/* Add genres display */}
        {book.genres && book.genres.length > 0 && (
          <div className="genres-container">
            {book.genres.map((genre, index) => (
              <span key={index} className="genre-tag">
                {genre} {/* Display genre tags */}
              </span>
            ))}
          </div>
        )}

        <div className="review-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Typography variant="h6">
              Reviews {/* Reviews section header */}
            </Typography>
            
            {user && !book.reviews.some(review => review.user === user.username) && !showReviewForm && (
              isMobile ? (
                <Button 
                  variant="outlined" 
                  onClick={handleAddReview}
                  className="write-review-button"
                  sx={{ 
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      backgroundColor: '#d8e4fc'
                    }
                  }}
                >
                  <span role="img" aria-label="write-review">✎</span> {/* Mobile write review button */}
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  onClick={handleAddReview}
                  startIcon={<span>✎</span>}
                  className="write-review-button"
                  sx={{ 
                    fontSize: '0.8rem',
                    padding: '4px 12px',
                    width: 'fit-content',
                    '&:hover': {
                      backgroundColor: '#d8e4fc'
                    }
                  }}
                >
                  <span className="button-text">Write a review</span> {/* Desktop write review button */}
                </Button>
              )
            )}
          </div>
          
          {/* Review form */}
          {showReviewForm && (
            <div className="review-form">
              <Rating
                value={newReview.rating}
                onChange={(event, newValue) => setNewReview({ ...newReview, rating: newValue })}
                size="large"
                sx={{ mb: 2 }}
              />
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                placeholder="What did you think?"
                style={{ width: '100%', minHeight: '150px', padding: '10px', marginBottom: '10px' }}
              />
              <Button 
                variant="contained" 
                onClick={handleReviewSubmit}
                sx={{ 
                  width: 'fit-content',  // Fit content width
                  '&:hover': {
                    backgroundColor: '#3c76f1'  // Hover color
                  }
                }}
              >
                Post Review {/* Submit review button */}
              </Button>
            </div>
          )}

          {/* Reviews list */}
          {book.reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">
                <Typography variant="subtitle2" fontWeight="bold">
                  {review.user} {/* Display reviewer's username */}
                </Typography>
                <Rating value={review.rating} readOnly size="small" /> {/* Display review rating */}
              </div>
              <div className="review-content-wrapper">
                <Typography className="review-content">
                  {review.content} {/* Display review content */}
                </Typography>
                {user && user.username === review.user && (
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteReview(review.id)}
                    className="delete-button"
                  >
                    Delete {/* Delete review button */}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Book;