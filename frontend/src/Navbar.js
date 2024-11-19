import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data from the session
    axios.get('/api/session-user')
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }, []);

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <nav className="top-right-buttons">
      {user.is_staff && (
        <button onClick={() => window.location.href = '/librarian'}>Librarian</button>
      )}
      {user.is_superuser && user.is_staff ? (
        <>
          <button onClick={() => window.location.href = '/admin'}>Admin Page</button>
          <button onClick={() => window.location.href = '/home'}>Home</button>
          <button onClick={() => window.location.href = '/borrow'}>Borrow</button>
          <button onClick={() => window.location.href = '/account'}>Account</button>
          <form action="/logout" method="post" style={{ display: 'inline' }}>
            <button type="submit">Logout</button>
          </form>
        </>
      ) : user.is_authenticated ? (
        <>
          <button onClick={() => window.location.href = '/home'}>Home</button>
          <button onClick={() => window.location.href = '/borrow'}>Borrow</button>
          <button onClick={() => window.location.href = '/account'}>Account</button>
          <form action="/logout" method="post" style={{ display: 'inline' }}>
            <button type="submit">Logout</button>
          </form>
        </>
      ) : (
        <>
          <button onClick={() => window.location.href = '/home'}>Home</button>
          <button onClick={() => window.location.href = '/register'}>Register</button>
          <button onClick={() => window.location.href = '/login'}>Login</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;