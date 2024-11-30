import React from 'react';
import Navbar from './Navbar';
import Borrow from './Borrow';
import Librarian from './librarian';
import Account from './account';
import EmailVerification from './EmailVerification';
import ResetPassword from './ResetPassword';
import Book from './Book';
import Home from './Home';
import './App.css';

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Function to extract uid and token from URL
  const getResetPasswordParams = () => {
    const path = window.location.pathname;
    const match = path.match(/\/reset-password\/([^/]+)\/([^/]+)/);
    return match ? { uid: match[1], token: match[2] } : null;
  };

  return (
    <div className="App">
      <Navbar user={user} setUser={setUser} currentPath={window.location.pathname} />
      <div className="main-content">
        {window.location.pathname === '/' && <Home />}
        {window.location.pathname === '/account' && <Account />}
        {window.location.pathname === '/borrow' && <Borrow />}
        {window.location.pathname.startsWith('/verify-email') && <EmailVerification />}
        {window.location.pathname === '/librarian' && <Librarian />}
        {window.location.pathname.startsWith('/book/') && <Book />}
        {window.location.pathname.startsWith('/reset-password/') && (
          <ResetPassword {...getResetPasswordParams()} />
        )}
      </div>
    </div>
  );
}

export default App;