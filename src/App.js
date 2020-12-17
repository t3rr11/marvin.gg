import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { generate } from 'build-number-generator';
import { createStore } from 'redux';

import Header from './modules/Header';
import Home from './pages/Home';
import Commands from './pages/Commands';
import Clans from './pages/Clans';
import Clan from './pages/Clan';
import Status from './pages/Status';
import Logs from './pages/Logs';
import Error from './modules/Error';
import Loader from './modules/Loader';
import SmallLoader from './modules/SmallLoader';
import * as Misc from './modules/Misc';
import * as Settings from './modules/Settings';
import * as Checks from './modules/scripts/Checks';
import * as Manifest from './modules/handlers/ManifestHandler';
import * as discord from './modules/requests/DiscordAuth';
import './css/style.css';

const backgrounds = ["BlueGradient", "GreenGradient", "PureLust", "FeelTheLove", "MidnightGradient", "Lawrencium"];

class App extends React.Component {
  state = {
    status: {
      status: "StartUp",
      statusText: "",
      loading: true,
      manifestMounted: false
    },
    currentPage: "home",
    currentBackground: "MidnightGradient",
    siteVersion: "1.0.2",
    showSettingsModal: false,
    isLive: false
  }
  async componentDidMount() {
    this.setState({ status: { status: 'startingUp', statusText: `Loading Guardianstats ${ this.state.siteVersion }`, loading: true }, currentBackground: this.getBackground() });
    if(!localStorage.getItem("siteVersion")) { this.forceReset(); }
    else {
      this.updatePage();
      if(localStorage.getItem("siteVersion") === this.state.siteVersion) {
        if(!await Checks.checkSettingsExist()) { Settings.setDefaultSettings(); }
        await new Promise(resolve => Manifest.Load((state) => { this.setState({ status: state }); if(state.manifestMounted) { resolve(); } }));
        if(!this.state.status.error) {
          if(Misc.getURLVars()["code"]) {
            const code = Misc.getURLVars()["code"];
            this.setState({ status: { status: 'verifyingDiscordCode', statusText: `Connecting with Discord...`, error: false, loading: true } });
            discord.getAccessToken(code);
          }
        }
      }
      else { this.forceReset(); }
    }
  }
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
  setBackground = (background) => {
    localStorage.setItem("background", background);
    this.setState({ currentBackground: this.getBackground() });
  }
  getBackground() {
    if(localStorage.getItem("background") && localStorage.getItem("background") !== "Auto") { return localStorage.getItem("background"); }
    else { return backgrounds[Math.floor(Math.random() * backgrounds.length)]; }
  }
  forceReset() {
    localStorage.clear();
    indexedDB.deleteDatabase("manifest");
    localStorage.setItem("siteVersion", this.state.siteVersion);
    window.location.reload();
  }
  render() {
    return (
      <Router>
        <div className="app" style={{ background: `var(--${this.state.currentBackground})` }}>
          <div className="footer">Beta { generate({ version: this.state.siteVersion, versionSeparator: "-" })}</div>
          <Header 
            setPage={ ((page) => this.setPage(page)) } currentPage={ this.state.currentPage }
            backgrounds={ backgrounds } currentBackground={ this.state.currentBackground } setBackground={ ((bg) => this.setBackground(bg)) }
          />
          <Switch>
            <Route exact path="/" render={ props => { return <Home /> } }/>
            <Route path="/home" render={ props => { return <Home /> } }/>
            <Route path="/commands" render={ props => { return <Commands /> } }/>
            <Route path="/clans" render={ props => { return <Clans selectedClan={ ((clanID) => props.history.push(`/clan/${ clanID }`)) } /> } }/>
            <Route path="/clan" render={ props => { return <Clan props={ props } /> } }/>
            <Route path="/status" render={ props => { return <Status /> } }/>
            <Route path="/logs" render={ props => { return <Logs /> } }/>
            <Route path="/loader" render={ props => { return <Loader statusText={ "Testing" } /> } }/>
            <Route path="/discord" render={ props => { return (window.location.href = "https://discord.gg/jbEbYej") } }/>
            <Route path="/test" render={ props => { return "" } }/>
            <Route path="*" render={ props => { return <Error error={ "This page was not found" } /> } }/>
          </Switch>
          { this.state.status.loading ? <SmallLoader error={ this.state.status.error } statusText={ this.state.status.statusText } /> : "" }
        </div>
      </Router>
    );
  }
}

export default App;