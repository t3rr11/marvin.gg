import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { generate, validate, parse, format } from 'build-number-generator';

import Header from './modules/Header';
import Home from './pages/Home';
import Commands from './pages/Commands';
import Status from './pages/Status';
import Logs from './pages/Logs';
import Error from './modules/Error';
import Loader from './modules/Loader';
import './css/style.css';

class App extends React.Component {
  state = {
    currentPage: "home",
    version: "1.0.0"
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
  getRandomBackground() {
    const backgrounds = ["BlueGradient", "GreenGradient", "MidnightGradient", "PurpleGradient"];
    return `var(--${ backgrounds[Math.floor(Math.random() * backgrounds.length)] })`;
  }
  render() {
    return (
      <Router>
        <div className="app" style={{ background: this.getRandomBackground() }}>
          <div className="footer">Beta { generate({ version: this.state.version, versionSeparator: "-" }) }</div>
          <Header setPage={ ((page) => this.setPage(page)) } currentPage={ this.state.currentPage } />
          <Switch>
            <Route path="/" render={ props => {
              switch(props.location.pathname) {
                case "/": { return <Home /> }
                case "/home": { return <Home /> }
                case "/commands": { return <Commands /> }
                case "/status": { return <Status /> }
                case "/logs": { return <Logs /> }
                case "/loader": { return <Loader statusText={ "Testing" } /> }
                default: { return <Error error={ "This page was not found" } /> }
              }
            }}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;