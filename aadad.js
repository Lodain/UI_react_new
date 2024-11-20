import axios from 'axios';
import React, { useState } from 'react';
import Navbar from './Navbar';
import axiosInstance from './axiosConfig';

function App() {
  const [user, setUser] = useState(null);
  const [details, setDetails] = useState([]);

  /*
  React.useEffect(() => {
    axiosInstance.get('/some-protected-route/')
      .then(res => {
        setDetails(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);*/

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      <h1>Library Management System</h1>
      {details.map((output, id) => (
        <div key={id}>
          <h2>{output.title}</h2>
          <p>Authors: {output.authors.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}

export default App;