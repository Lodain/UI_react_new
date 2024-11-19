import axios from 'axios';
import React, { useState } from 'react';
import Navbar from './Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [details, setDetails] = useState([]);

  React.useEffect(() => {
    axios.get('http://127.0.0.1:8080')
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
      <h1>Library Management System</h1>
      {details.map((output, id) => (
        <div key={id}>
          <h1>{output.title}</h1>
          <p>Authors: {output.authors.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
