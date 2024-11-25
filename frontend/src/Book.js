import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import { Card, CardContent, CardMedia, Typography, Rating, Button } from '@mui/material';

function Book() {
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, content: '' });

  useEffect(() => {
    // Add user check
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    // Extract ISBN from URL path
    const pathSegments = window.location.pathname.split('/');
    const isbn = pathSegments[pathSegments.length - 1];

    if (isbn) {
      axiosInstance.get(`/book/${isbn}/`)
        .then(response => {
          setBook(response.data);
        })
        .catch(error => {
          setError(error.response?.data?.error || 'An error occurred');
        });
    }
  }, []);

  const handleBorrow = () => {
    if (book) {
      axiosInstance.post('borrow_book_api', { book_id: book.isbn })
        .then(response => {
          alert(response.data.message);
        })
        .catch(error => {
          alert(error.response?.data?.error || 'Error borrowing book');
        });
    }
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
    <div style={{ padding: '20px' }}>
      <Card sx={{ maxWidth: 800, margin: '0 auto' }}>
        {book.cover && (
          <CardMedia
            component="img"
            height="400"
            image={`http://127.0.0.1:8080${book.cover}`}
            alt={book.title}
            sx={{ objectFit: 'contain' }}
          />
        )}
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {book.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            by {book.authors.join(', ')}
          </Typography>
          <Typography variant="body1" gutterBottom>
            ISBN: {book.isbn}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Year: {book.year}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Available Copies: {book.copies - book.lended}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Average Rating: <Rating value={book.average_rating} readOnly precision={0.5} />
            ({book.average_rating.toFixed(1)})
          </Typography>

          {user && (
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleBorrow}
                disabled={book.copies <= book.lended}
                sx={{ marginRight: '10px' }}
              >
                Borrow Book
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleWishlist}
              >
                {book.in_wishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          )}

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Reviews
          </Typography>
          {user && !book.reviews.some(review => review.user === user.username) && (
            <Button onClick={handleAddReview}>+</Button>
          )}
          {showReviewForm && (
            <Card sx={{ mb: 2, backgroundColor: '#f5f5f5' }}>
              <CardContent>
                <Rating
                  value={newReview.rating}
                  onChange={(event, newValue) => setNewReview({ ...newReview, rating: newValue })}
                  size="small"
                />
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  placeholder="Write your review here..."
                  style={{ width: '100%', height: '100px' }}
                />
                <Button onClick={handleReviewSubmit}>Submit</Button>
              </CardContent>
            </Card>
          )}
          {book.reviews.length > 0 ? (
            book.reviews
              .sort((a, b) => {
                // If user is logged in, put their review first
                if (user && a.user === user.username) return -1;
                if (user && b.user === user.username) return 1;
                return 0;
              })
              .map((review, index) => (
                <Card key={index} sx={{ mb: 2, backgroundColor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="subtitle2">
                      {review.user}
                    </Typography>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2">
                      {review.content}
                    </Typography>
                    {user && user.username === review.user && (
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
          ) : (
            <Typography variant="body2">No reviews yet</Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Book;