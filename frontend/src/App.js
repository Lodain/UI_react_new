/* In this file I implement the main app structure, including the navbar, routes, and protected routes.
   Every team member wrote their own pages separately - Spera Danilo - xsperad00 */
// Import React and useState hook for managing component state
import React, { useState } from 'react';
// Import routing components from react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import styles
import './App.css';
// Import components
import Navbar from './component/Navbar';
import Home from './component/Home';
import Account from './component/account';
import Book from './component/Book';
import Borrow from './component/Borrow';
import Librarian from './component/librarian';
import EmailVerification from './component/EmailVerification';
import ResetPassword from './component/ResetPassword';

function App() {
  // State to manage the current user, initialized from session storage
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')));

  // Protected Route component to restrict access based on user authentication and role
  const ProtectedRoute = ({ children, requireStaff = false }) => {
    // Redirect to home if user is not logged in
    if (!user) {
      return <Navigate to="/" />;
    }
    
    // Redirect to home if route requires staff access and user is not staff
    if (requireStaff && !user.staff) {
      return <Navigate to="/" />;
    }

    // Render the children components if access is allowed
    return children;
  };

  return (
    <Router>
      <div className="App">
        {/* Navbar component with user and setUser props for managing user state */}
        <Navbar 
          user={user} 
          setUser={setUser} 
          currentPath={window.location.pathname}
        />
        <Routes>
          {/* Define routes for the application */}
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