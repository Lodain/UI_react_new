import axios from 'axios';
import React from 'react';
import Navbar from './Navbar';
class App extends React.Component {
  state = {details: [],}

  componentDidMount() {
    let data;
    axios.get('http://127.0.0.1:8080')
    .then(res => {
      data = res.data;
      this.setState({details: data});
    })
    .catch(err => {
      console.log(err);
    })
  }

  render() {
    return (
      <div>
        <Navbar user={this.state.user} />
        <h1>Library Management System</h1>
        {this.state.details.map((output, id) => (
          <div key={id}>
            <h1>{output.title}</h1>
            <p>Authors: {output.authors.join(', ')}</p>
          </div>
        ))}
      </div>
    );
  }
}

export default App;
