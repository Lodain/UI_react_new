/*In this file I implement the main app structure, including the navbar, routes, and protected routes.
Every team member writed their own pages separately - Spera Danilo - xsperad00 */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Home from './Home';
import Account from './account';
import Book from './Book';
import Borrow from './Borrow';
import Librarian from './librarian';
import EmailVerification from './EmailVerification';
import ResetPassword from './ResetPassword';

function App() {
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')));

  // Protected Route component
  const ProtectedRoute = ({ children, requireStaff = false }) => {
    // Check if user is logged in
    if (!user) {
      return <Navigate to="/" />;
    }
    
    // Check if route requires staff access
    if (requireStaff && !user.staff) {
      return <Navigate to="/" />;
    }

    return children;
  };

  return (
    <Router>
      <div className="App">
        <Navbar 
          user={user} 
          setUser={setUser} 
          currentPath={window.location.pathname}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:isbn" element={<Book />} />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/borrow" 
            element={
              <ProtectedRoute>
                <Borrow />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/librarian" 
            element={
              <ProtectedRoute requireStaff={true}>
                <Librarian />
              </ProtectedRoute>
            } 
          />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;