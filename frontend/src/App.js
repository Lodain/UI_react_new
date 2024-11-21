import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Borrow from './Borrow';
import axiosInstance from './axiosConfig';
import Account from './account';
import EmailVerification from './EmailVerification';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    axiosInstance.get('/')
      .then(res => {
        setDetails(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      {window.location.pathname === '/' && (
        <>
          <h1>Library Management System</h1>
          {user && <h2>Welcome back, {user.username}!</h2>}
          <div align="center">
          {details.map((output, id) => (
            <div className="card-container" key={id}>
              <Card sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
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
          ))}
          </div>
        </>
      )}
      {window.location.pathname === '/account' && <Account />}
      {window.location.pathname === '/borrow' && <Borrow />}
      {window.location.pathname.startsWith('/verify-email') && <EmailVerification />}
    </div>
  );
}

export default App;