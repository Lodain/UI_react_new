import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Borrow from './Borrow';
import Librarian from './librarian';
import axiosInstance from './axiosConfig';
import Account from './account';
import EmailVerification from './EmailVerification';
import ResetPassword from './ResetPassword';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import './App.css';
import Book from './Book';

function App() {
  const [user, setUser] = useState(null);
  const [details, setDetails] = useState([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

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

  // Function to extract uid and token from URL
  const getResetPasswordParams = () => {
    const path = window.location.pathname;
    const match = path.match(/\/reset-password\/([^/]+)\/([^/]+)/);
    return match ? { uid: match[1], token: match[2] } : null;
  };

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      {window.location.pathname === '/' && (
        <>
          <div className="banner">
            <div className="banner-text">
              <h2>Welcome to BiblioBase</h2>
              <p>Discover a world of books and knowledge.</p>
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
          {user && <h2>Welcome back, {user.username}!</h2>}
          <div align="center">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div className="skeleton-card" key={index}></div>
              ))
            ) : (
              details.map((output, id) => (
                <div className="card-container" key={id}>
                  <Card 
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.location.href = `/book/${output.isbn}`}
                  >
                    <CardMedia
                      className="card-media"
                      component="img"
                      image={`http://127.0.0.1:8080${output.cover}`}
                      alt={output.title}
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
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontSize: '1rem',
                          marginBottom: '4px',
                          minHeight: '2.4em'
                        }}
                      >
                        {output.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontSize: '0.8rem',
                          minHeight: '2em'
                        }}
                      >
                        Authors: {output.authors.join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </>
      )}
      {window.location.pathname === '/account' && <Account />}
      {window.location.pathname === '/borrow' && <Borrow />}
      {window.location.pathname.startsWith('/verify-email') && <EmailVerification />}
      {window.location.pathname === '/librarian' && <Librarian />}
      {window.location.pathname.startsWith('/book/') && <Book />}
      {window.location.pathname.startsWith('/reset-password/') && (
        <ResetPassword {...getResetPasswordParams()} />
      )}
    </div>
  );
}

export default App;