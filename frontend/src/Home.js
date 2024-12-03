import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import home from './img/home.png';
import axiosInstance from './axiosConfig';
import axios from 'axios';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [details, setDetails] = useState([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch initial data
  useEffect(() => {
    axiosInstance.get('/')
      .then(res => {
        setDetails(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  // Book rotation effect
  useEffect(() => {
    if (details.length === 0) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentBookIndex((prevIndex) => 
          prevIndex === details.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 500);
      
    }, 3000);

    return () => clearInterval(interval);
  }, [details]);

  // Search debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchBooks(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchBooks = async (query) => {
    setIsSearching(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8080/search-books/?query=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsSearching(false);
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
            <div className="skeleton-image"></div>
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
                <div className="skeleton-card" key={index}></div>
              ))}
            </div>
          ) : (
            searchResults.map((book, id) => (
              <BookCard key={id} book={book} />
            ))
          )
        ) : (
          loading ? (
            <div className="skeleton-container">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="skeleton-card" key={index}></div>
              ))}
            </div>
          ) : (
            details.map((output, id) => (
              <BookCard key={id} book={output} />
            ))
          )
        )}
      </div>
    </>
  );
}

// Helper component for book cards
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
        onClick={() => navigate(`/book/${book.isbn}`)}
      >
        <CardMedia
          className="card-media"
          component="img"
          image={book.cover ? `http://127.0.0.1:8080${book.cover}` : 'placeholder-image-url'}
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
