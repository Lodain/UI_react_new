import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import axiosInstance from './axiosConfig';
import Account from './account';

function App() {
  const [user, setUser] = useState(null);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    // Check if user information is stored in session storage
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
            <div key={id}>
              <h2>{output.title}</h2>
              <p>Authors: {output.authors.join(', ')}</p>
            </div>
          ))}
        </>
      )}
      {window.location.pathname === '/account' && <Account />}
    </div>
  );
}

export default App;