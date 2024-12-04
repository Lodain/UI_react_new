import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import home from './img/home.png';
import placeholder from './img/Image-not-found.png';
import axiosInstance from './axiosConfig';
import axios from 'axios';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  // State variables to manage book details, current book index, loading state, etc.
  const [details, setDetails] = useState([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch initial data when component mounts
  useEffect(() => {
    axiosInstance.get('/')
      .then(res => {
        setDetails(res.data); // Set book details from response
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch(err => {
        console.log(err); // Log any errors
        setLoading(false); // Ensure loading is false even if there's an error
      });
  }, []);

  // Effect to handle book rotation every 3 seconds
  useEffect(() => {
    if (details.length === 0) return; // Exit if no details

    const interval = setInterval(() => {
      setIsTransitioning(true); // Start transition effect

      setTimeout(() => {
        // Update current book index, cycling back to start if at the end
        setCurrentBookIndex((prevIndex) => 
          prevIndex === details.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false); // End transition effect
      }, 500);
      
    }, 3000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [details]);

  // Effect to debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchBooks(searchQuery); // Perform search if query exists
      } else {
        setSearchResults([]); // Clear results if query is empty
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn); // Cleanup timeout on unmount
  }, [searchQuery]);

  // Function to search books based on query
  const searchBooks = async (query) => {
    setIsSearching(true); // Set searching state to true
    try {
      const response = await axios.get(`http://127.0.0.1:8080/search-books/?query=${query}`);
      setSearchResults(response.data); // Set search results from response
    } catch (error) {
      console.error('Error searching books:', error); // Log any errors
    } finally {
      setIsSearching(false); // Set searching state to false
    }
  };

  return (
    <>
      <div className="banner">
        <div className="banner-text">
          <h2>Welcome to BiblioBase</h2>
          <p>Your journey through the pages starts here.</p>
        </div>
        <div className="banner-center-image">
          <img 
            src={home}
            alt="Banner Center"
            className="banner-center-img"
          />
        </div>
        <div className="banner-content">
          {loading ? (
            <div className="skeleton-image"></div> // Show skeleton while loading
          ) : (
            details.length > 0 && (
              <img
                className={`banner-image ${isTransitioning ? 'sliding-out' : 'banner-image-enter'}`}
                src={`http://127.0.0.1:8080${details[currentBookIndex].cover}`}
                alt={details[currentBookIndex].title}
                onClick={() => window.location.href = `/book/${details[currentBookIndex].isbn}`}
                style={{
                  maxWidth: '300px',
                  height: '450px',
                  objectFit: 'contain',
                  cursor: 'pointer'
                }}
              />
            )
          )}
        </div>
      </div>
      <div className="books-title">
        Books:
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Title, ISBN, author, genre"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      <div align="center">
        {searchQuery ? (
          isSearching ? (
            <div className="skeleton-container">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="skeleton-card" key={index}></div> // Show skeletons while searching
              ))}
            </div>
          ) : (
            searchResults.map((book, id) => (
              <BookCard key={id} book={book} /> // Display search results
            ))
          )
        ) : (
          loading ? (
            <div className="skeleton-container">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="skeleton-card" key={index}></div> // Show skeletons while loading
              ))}
            </div>
          ) : (
            details.map((output, id) => (
              <BookCard key={id} book={output} /> // Display book details
            ))
          )
        )}
      </div>
    </>
  );
}

// Helper component for rendering individual book cards
function BookCard({ book }) {
  const navigate = useNavigate();
  
  return (
    <div className="card-container">
      <Card 
        sx={{ 
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={() => navigate(`/book/${book.isbn}`)} // Navigate to book details on click
      >
        <CardMedia
          className="card-media"
          component="img"
          image={book.cover ? `http://127.0.0.1:8080${book.cover}` : placeholder}
          alt={book.title}
          sx={{
            padding: '10px',
            objectFit: 'contain',
            height: 300
          }}
        />
        <CardContent sx={{ 
          padding: '8px', 
          flexGrow: 0,
          '&:last-child': { 
            paddingBottom: '8px' 
          }
        }}>
          <Typography 
            gutterBottom 
            variant="h6" 
            component="div"
            className="card-title"
          >
            {book.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            className="card-authors"
          >
            Authors: {book.authors.join(', ')}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;
