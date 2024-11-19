import axios from 'axios';

class App extends React.Component {
  state = {details: [],}

  componentDidMount() {
    let data;
    axios.get('http://127.0.0.1:8080/api/books/')
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
        <h1>Library Management System</h1>
      </div>
    );
  }
}

export default App;
