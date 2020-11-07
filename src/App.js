import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Header from './modules/Header';
import Home from './pages/Home';
import Status from './pages/Status';
import Logs from './pages/Logs';
import Error from './modules/Error';
import Loader from './modules/Loader';
import './css/style.css';

class App extends React.Component {
  state = {
    currentPage: "home"
  }
  componentDidMount() { this.updatePage(); }
  updatePage() {
    if(!localStorage.getItem("currentPage") || window.location.pathname.split("/")[1] !== localStorage.getItem("currentPage")) {
      var currentPage = window.location.pathname.split("/")[1];
      if(currentPage === "" || currentPage === "failed") { currentPage = "home"; }
      localStorage.setItem("currentPage", currentPage);
      this.setState({ currentPage: currentPage });
    }
    else { this.setState({ currentPage: localStorage.getItem("currentPage") }); }
  }
  setPage = (page) => { localStorage.setItem("currentPage", page); this.setState({ currentPage: page }); }
  render() {
    return (
      <Router>
        <div className="app">
          <Header setPage={ ((page) => this.setPage(page)) } currentPage={ this.state.currentPage } />
          <Switch>
            <Route path="/" render={ props => {
              switch(props.location.pathname) {
                case "/": { return <Home /> }
                case "/home": { return <Home /> }
                case "/status": { return <Status /> }
                case "/logs": { return <Logs /> }
                case "/loader": { return <Loader statusText={ "Testing" } /> }
                default: { return <Error /> }
              }
            }}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;