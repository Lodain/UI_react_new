import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import { Typography, Rating, Button, Modal, Box } from '@mui/material';
import LoadingModal from './component/LoadingModal';
import './style/Book.css';
import { useParams } from 'react-router-dom';

function Book() {
  const { isbn } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [responseModal, setResponseModal] = useState({
    open: false,
    message: '',
    isSuccess: false
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Add user check
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    // Extract ISBN from URL path
    fetchBookDetails(isbn);
  }, [isbn]);

  const fetchBookDetails = (isbn) => {
    if (isbn) {
      axiosInstance.get(`/book/${isbn}/`)
        .then(response => {
          setBook(response.data);
        })
        .catch(error => {
          setError(error.response?.data?.error || 'An error occurred');
        });
    }
  };

  const handleBorrow = () => {
    if (book) {
      setIsLoading(true);
      axiosInstance.post('borrow_book_api', { book_id: book.isbn })
        .then(response => {
          setResponseModal({
            open: true,
            message: response.data.message,
            isSuccess: true
          });
          // Reload book data to update available copies
          axiosInstance.get(`/book/${book.isbn}/`)
            .then(response => {
              setBook(response.data);
            })
            .catch(error => {
              console.error('Error refreshing book data:', error);
            });
        })
        .catch(error => {
          setResponseModal({
            open: true,
            message: error.response?.data?.error || 'Error borrowing book',
            isSuccess: false
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleCloseResponseModal = () => {
    setResponseModal(prev => ({ ...prev, open: false }));
  };

  const handleWishlist = () => {
    if (book) {
      axiosInstance.post(`/toggle_wishlist/${book.isbn}/`)
        .then(response => {
          setBook({
            ...book,
            in_wishlist: !book.in_wishlist
          });
        })
        .catch(error => {
          alert(error.response?.data?.error || 'Error updating wishlist');
        });
    }
  };

  const handleAddReview = () => {
    setShowReviewForm(true);
  };

  const handleReviewSubmit = () => {
    if (book) {
      axiosInstance.post(`/add_review/${book.isbn}/`, newReview)
        .then(response => {
          setBook({
            ...book,
            reviews: [...book.reviews, response.data],
            average_rating: response.data.average_rating
          });
          setShowReviewForm(false);
          setNewReview({ rating: 0, content: '' });
        })
        .catch(error => {
          alert(error.response?.data?.error || 'Error adding review');
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
          });
        })
        .catch(error => {
          alert(error.response?.data?.error || 'Error deleting review');
        });
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!book) return <div>Loading...</div>;

  return (
    <div className="book-container">
      <LoadingModal show={isLoading} />

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
            {responseModal.isSuccess ? 'Success!' : 'Error'}
          </Typography>
          <Typography sx={{ mb: 2 }}>
            {responseModal.message}
          </Typography>
          <Button 
            onClick={handleCloseResponseModal}
            variant="contained"
            sx={{ 
              backgroundColor: '#394e75',
              '&:hover': { backgroundColor: '#2c3c59' }
            }}
          >
            Close
          </Button>
        </Box>
      </Modal>

      <div className="book-cover-section">
        {book.cover && (
          <img
            src={`http://127.0.0.1:8080${book.cover}`}
            alt={book.title}
          />
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
                height: '52px',
                fontSize: '0.9rem'  // Smaller font
              }}
              onClick={handleBorrow}
              disabled={book.copies <= book.lended}
            >
              Borrow
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
                height: '52px',
                fontSize: '0.9rem'  // Smaller font
              }}
              onClick={handleWishlist}
            >
              {book.in_wishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
          </div>
        )}
      </div>

      <div className="book-details-section">
        <Typography variant="h4" gutterBottom>
          {book.title}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          by {book.authors.join(', ')}
        </Typography>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Rating value={book.average_rating} readOnly precision={0.5} />
          <Typography variant="body2" color="text.secondary">
            {book.average_rating.toFixed(1)} · {book.reviews.length} ratings
          </Typography>
        </div>

        {/* Book details */}
        <Typography variant="body2" color="text.secondary" paragraph>
          ISBN: {book.isbn} · Published {book.year} · {book.copies - book.lended} available copies
        </Typography>

        {/* Add genres display */}
        {book.genres && book.genres.length > 0 && (
          <div className="genres-container">
            {book.genres.map((genre, index) => (
              <span key={index} className="genre-tag">
                {genre}
              </span>
            ))}
          </div>
        )}

        <div className="review-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Typography variant="h6">
              Reviews
            </Typography>
            
            {user && !book.reviews.some(review => review.user === user.username) && !showReviewForm && (
              <Button 
                variant="outlined" 
                onClick={handleAddReview}
                startIcon={<span>✎</span>}
                sx={{ 
                  fontSize: '0.8rem',
                  padding: '4px 12px',
                  width: 'fit-content',
                  '&:hover': {
                    backgroundColor: '#d8e4fc'
                  }
                }}
              >
                Write a review
              </Button>
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
                Post Review
              </Button>
            </div>
          )}

          {/* Reviews list */}
          {book.reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">
                <Typography variant="subtitle2" fontWeight="bold">
                  {review.user}
                </Typography>
                <Rating value={review.rating} readOnly size="small" />
              </div>
              <div className="review-content-wrapper">
                <Typography className="review-content">
                  {review.content}
                </Typography>
                {user && user.username === review.user && (
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteReview(review.id)}
                    className="delete-button"
                  >
                    Delete
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