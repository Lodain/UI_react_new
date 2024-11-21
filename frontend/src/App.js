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
          {details.map((output, id) => (
            <div className="card-container">
            <Card key={id} style={{ maxWidth: 345, margin: '20px auto' }}>
              <CardMedia
                component="img"
                height="140"
                image={`http://127.0.0.1:8080${output.cover}`}
                alt={output.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {output.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Authors: {output.authors.join(', ')}
                </Typography>
              </CardContent>
            </Card>
            </div>
          ))}
        </>
      )}
      {window.location.pathname === '/account' && <Account />}
      {window.location.pathname === '/borrow' && <Borrow />}
      {window.location.pathname.startsWith('/verify-email') && <EmailVerification />}
    </div>
  );
}

export default App;