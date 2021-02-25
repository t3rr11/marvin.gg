import React from 'react';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import * as apiRequest from '../modules/requests/API';

let updateTimer = null;

class Logs extends React.Component {

  state = {
    status: {
      status: 'startUp',
      statusText: 'Getting ready!',
      error: null,
      loading: true
    },
    logs: {
      frontend: { },
      backend: { },
      express: { },
      database: { },
      globals: { },
      errorHandler: { }
    },
    view: "overview",
    userInterface: false,
    lastUpdate: new Date().toISOString()
  }

  componentDidMount() {
    this.setState({ status: { status: 'startUp', statusText: `Checking authorization...`, loading: true } });
    this.CheckAuthorization();
  }
  componentWillUnmount() { clearInterval(updateTimer); updateTimer = null; }

  async CheckAuthorization() {
    const adminToken = localStorage.getItem("adminToken");
    if(adminToken) {
      await apiRequest.CheckAuthorization({ token: adminToken }).then((response) => {
        if(response.code === 200) {
          if(this.state.status.status === "startUp") { this.SetupLogs(); }
          setTimeout(() => this.CheckAuthorization(), 1000 * 60);
        }
        else { window.location.href = "/"; }
      });
    }
    else { window.location.href = "/"; }
  }

  setView(page) { this.setState({ view: page }); }

  async SetupLogs() {
    this.setState({ status: { status: 'startingUp', statusText: `Obtaining the logs...`, loading: true } });
    await Promise.all([
      await apiRequest.GetFrontendStartup(),
      await apiRequest.GetBackendStartup(),
      await apiRequest.GetExpressStartup(),
      await apiRequest.GetGlobalsStartup()
    ]).then(async (data) => {
      let frontendStartup = data[0]; let backendStartup = data[1]; let expressStartup = data[2]; let globalsStartup = data[3];
      if(!frontendStartup?.isError && !backendStartup?.isError && !expressStartup?.isError && !globalsStartup?.isError) {
        await Promise.all([
          await apiRequest.GetFrontendLogs({ date: frontendStartup.data[0].date }),
          await apiRequest.GetBackendLogs({ date: backendStartup.data[0].date }),
          await apiRequest.GetExpressLogs({ date: expressStartup.data[0].date }),
          await apiRequest.GetDatabaseLogs({ date: frontendStartup.data[0].date }),
          await apiRequest.GetBroadcasts({ date: frontendStartup.data[0].date }),
          await apiRequest.GetGlobalsLogs({ date: globalsStartup.data[0].date }),
          await apiRequest.GetErrorHandlerLogs({ date: new Date((new Date() - (1000 * 86400)) + 37800000).toISOString() })
        ]).then((log_data) => {

          //Save state
          this.setState({
            status: { status: 'ready', statusText: `Finished Updating Logs.`, loading: false },
            logs: {
              frontend: log_data[0].data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
              backend: log_data[1].data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
              express: log_data[2].data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
              clan: log_data[3].data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
              database: log_data[4].data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
              globals: log_data[5].data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
              errorHandler: log_data[6].data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            },
            lastUpdate: new Date().toISOString()
          });

          //Start update timer
          if(updateTimer === null) { updateTimer = setInterval(() => { this.UpdateLogs(); }, 5000); }
        });
      }
      else {
        //Save error state
        this.setState({ status: { status: 'error', statusText: `Error Loading Logs. Server Offline. Re-checking in 5 seconds.`, loading: false } });
        setTimeout(() => { this.SetupLogs() }, 5000);
      }
    });
  }
  async UpdateLogs() {
    let logs = await apiRequest.GetLogs({ date: this.state.lastUpdate });
    let broadcasts = await apiRequest.GetBroadcasts({ date: this.state.lastUpdate });
    if(!logs?.isError) {
      if(logs.data.length > 0 || broadcasts.data.length > 0) {
        let { frontend, backend, express, database, globals, errorHandler } = this.state.logs;
        let startupDetected = false;
        for(let i in broadcasts.data) { database.unshift(broadcasts.data[i]); }
        for(let i in logs.data) {
          if(logs.data[i].type === "Startup") { startupDetected = true; }
          else {
            switch(logs.data[i].location || logs.data[i].type) {
              case "Frontend": { frontend.unshift(logs.data[i]); break; }
              case "Backend": { backend.unshift(logs.data[i]); break; }
              case "Express": { express.unshift(logs.data[i]); break; }
              case "Database": { database.unshift(logs.data[i]); break; }
              case "Globals": { globals.unshift(logs.data[i]); break; }
              case "Error": { errorHandler.unshift(logs.data[i]); break; }
            }
          }
        }
        if(!startupDetected) {
          frontend.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          backend.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          express.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          database.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          globals.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          errorHandler.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          //Save state
          this.setState({
            status: { status: 'ready', statusText: `Finished Updating Logs.`, loading: false },
            logs: { frontend, backend, express, database, globals, errorHandler },
            lastUpdate: new Date().toISOString()
          });
        }
        else { this.SetupLogs() }
      }
    }
  }

  openUserInterface = (user) => {
    this.setState({ userInterface: user })
  }
  closeUserInterface = () => {
    this.setState({ userInterface: false })
  }

  render() {
    const { status, statusText } = this.state.status;
    const buildLog = (log, type) => {
      return (
        <div className={`${ type }-log-data`}>
          <div className={`${ log.type }-log`}>{ log.type }</div>
          <div className={`${ log.type }-log`}>{ log.log }</div>
          <div className={`${ log.type }-log`}>{ new Date(log.date).toLocaleString("en-AU") }</div>
        </div>
      );
    }
    const buildSmartLog = (log, type) => {
      if(type === "frontend" && log.type === "Command") {
        let split = log.log.split(',');
        let user = split[0].slice(6, split[0].length);
        let command = split[1].slice(10, split[1].length);
        return (
          <div className={`${ type }-log-data`}>
            <div className={`${ log.type }-log`}>{ log.type }</div>
            <div className={`${ log.type }-log`}>User: <span onClick={ (() => this.openUserInterface(user)) }>{ user }</span>, Command: <span>{ command }</span></div>
            <div className={`${ log.type }-log`}>{ new Date(log.date).toLocaleString("en-AU") }</div>
          </div>
        );
      }
      else {
        return (
          <div className={`${ type }-log-data`}>
            <div className={`${ log.type }-log`}>{ log.type }</div>
            <div className={`${ log.type }-log`}>{ log.log }</div>
            <div className={`${ log.type }-log`}>{ new Date(log.date).toLocaleString("en-AU") }</div>
          </div>
        );
      }
    }
    const buildBroadcast = (log, type) => {
      return (
        <div className={`${ type }-log-data`}>
          <div className={`${ log.type }-log`}>{ log.type }</div>
          <div className={`${ log.type }-log`}>{ log.clanID }</div>
          <div className={`${ log.type }-log`}>{ log.guildID }</div>
          <div className={`${ log.type }-log`}>{ log.membershipID }</div>
          <div className={`${ log.type }-log`}>{ log.displayName }</div>
          <div className={`${ log.type }-log`}>{ log.broadcast }</div>
          <div className={`${ log.type }-log`}>{ log.count }</div>
          <div className={`${ log.type }-log`}>{ new Date(log.date).toLocaleString("en-AU") }</div>
        </div>
      );
    }
    if(status === "error") { return (<Error error={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          <div className="logs-menu">
            <div className={ this.state.view === 'overview' ? 'active' : '' } onClick={ (() => this.setView("overview")) }>Overview</div>
            <div className={ this.state.view === 'frontend' ? 'active' : '' } onClick={ (() => this.setView("frontend")) }>Frontend</div>
            <div className={ this.state.view === 'backend' ? 'active' : '' } onClick={ (() => this.setView("backend")) }>Backend</div>
            <div className={ this.state.view === 'express' ? 'active' : '' } onClick={ (() => this.setView("express")) }>Express</div>
            <div className={ this.state.view === 'globals' ? 'active' : '' } onClick={ (() => this.setView("globals")) }>Globals</div>
            <div className={ this.state.view === 'database' ? 'active' : '' } onClick={ (() => this.setView("database")) }>Database</div>
            <div className={ this.state.view === 'errorHandler' ? 'active' : '' } onClick={ (() => this.setView("errorHandler")) }>Errors</div>
          </div>
          <LoadLogs view={ this.state.view } logs={ this.state.logs } buildLog={buildLog} buildSmartLog={buildSmartLog} buildBroadcast={buildBroadcast} />
          { this.state.userInterface ? <UserInterface currentBackground={this.props.currentBackground} user={this.state.userInterface} closeUserInterface={(() => this.closeUserInterface())} /> : null }
        </div>
      )
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}
class LoadLogs extends React.Component {
  render() {
    const view = this.props.view;
    if(view === "overview") {
      return (
        <div className="logs-container transScrollbar" style={{ gridTemplateColumns: "54% 44%", gridTemplateRows: "300px 300px 200px", gridGap: "5px 10px" }}>
          <BackendLogs data={ this.props.logs.backend } buildLog={this.props.buildLog} buildSmartLog={this.props.buildSmartLog} buildBroadcast={this.props.buildBroadcast} style={{ fontSize: "14px", paddingLeft: "10px", gridRow: "1", gridColumn: "1" }} />
          <FrontendLogs data={ this.props.logs.frontend } buildLog={this.props.buildLog} buildSmartLog={this.props.buildSmartLog} buildBroadcast={this.props.buildBroadcast} style={{ fontSize: "14px", gridRow: "1", gridColumn: "2" }} />
          <DatabaseLogs data={ this.props.logs.database } buildLog={this.props.buildLog} buildSmartLog={this.props.buildSmartLog} buildBroadcast={this.props.buildBroadcast} style={{ fontSize: "14px", paddingLeft: "10px", gridRow: "2", gridColumn: "span 2" }} />
          <ErrorLogs data={ this.props.logs.errorHandler } buildLog={this.props.buildLog} buildSmartLog={this.props.buildSmartLog} buildBroadcast={this.props.buildBroadcast} style={{ fontSize: "14px", paddingLeft: "10px", gridRow: "3", gridColumn: "span 2" }} />
        </div>
      )
    }
    else if(view === "backend") { return (<div className="logs-container"><BackendLogs data={ this.props.logs.backend } buildLog={this.props.buildLog} buildSmartLog={this.props.buildSmartLog} buildBroadcast={this.props.buildBroadcast} style={{ fontSize: "14px", paddingLeft: "10px", gridRow: "span 1/2", gridColumn: "1" }} /></div>) }
    else if(view === "frontend") { return (<div className="logs-container"><FrontendLogs data={ this.props.logs.frontend } buildLog={this.props.buildLog} buildSmartLog={this.props.buildSmartLog} buildBroadcast={this.props.buildBroadcast} style={{ fontSize: "14px", paddingLeft: "10px", gridRow: "span 1/2", gridColumn: "1" }} /></div>) }
    else if(view === "express") { return (<div className="logs-container"><ExpressLogs data={ this.props.logs.express } buildLog={this.props.buildLog} buildSmartLog={this.props.buildSmartLog} buildBroadcast={this.props.buildBroadcast} style={{ fontSize: "14px", paddingLeft: "10px", gridRow: "span 1/2", gridColumn: "1" }} /></div>) }
    else if(view === "globals") { return (<div className="logs-container"><GlobalLogs data={ this.props.logs.globals } buildLog={this.props.buildLog} buildSmartLog={this.props.buildSmartLog} buildBroadcast={this.props.buildBroadcast} style={{ fontSize: "14px", paddingLeft: "10px", gridRow: "span 1/2", gridColumn: "1" }} /></div>) }
    else if(view === "database") { return (<div className="logs-container"><DatabaseLogs data={ this.props.logs.database } buildLog={this.props.buildLog} buildSmartLog={this.props.buildSmartLog} buildBroadcast={this.props.buildBroadcast} style={{ fontSize: "14px", paddingLeft: "10px", gridRow: "span 1/2", gridColumn: "1" }} /></div>) }
    else if(view === "errorHandler") { return (<div className="logs-container"><ErrorLogs data={ this.props.logs.errorHandler } buildLog={this.props.buildLog} buildSmartLog={this.props.buildSmartLog} buildBroadcast={this.props.buildBroadcast} style={{ fontSize: "14px", paddingLeft: "10px", gridRow: "span 1/2", gridColumn: "1" }} /></div>) }
  }
}
class BackendLogs extends React.Component {
  render() {
    const backend = this.props.data;
    return (
      <div className="log-container transScrollbar" id="backend" style={ this.props.style }>
        <div className="logs transScrollbar" id="backend-logs">
          <div className="log-info"><div className="log-info-name">Backend</div></div>
          { backend.map((log) => { return this.props.buildLog(log, "backend") }) }
        </div>
      </div>
    )
  }
}
class FrontendLogs extends React.Component {
  render() {
    const frontend = this.props.data;
    return (
      <div className="log-container transScrollbar" id="frontend" style={ this.props.style }>
        <div className="logs transScrollbar" id="frontend-logs">
          <div className="log-info"><div className="log-info-name">Frontend</div></div>
          { frontend.map((log) => { return this.props.buildSmartLog(log, "frontend") }) }
        </div>
      </div>
    )
  }
}
class ExpressLogs extends React.Component {
  render() {
    const express = this.props.data;
    return (
      <div className="log-container transScrollbar" id="express" style={ this.props.style }>
        <div className="logs transScrollbar" id="express-logs">
          <div className="log-info"><div className="log-info-name">Express</div></div>
          { express.map((log) => { return this.props.buildLog(log, "express") }) }
        </div>
      </div>
    )
  }
}
class GlobalLogs extends React.Component {
  render() {
    const globals = this.props.data;
    return (
      <div className="log-container transScrollbar" id="globals" style={ this.props.style }>
        <div className="logs transScrollbar" id="globals-logs">
          <div className="log-info"><div className="log-info-name">Globals</div></div>
          { globals.map((log) => { return this.props.buildLog(log, "globals") }) }
        </div>
      </div>
    )
  }
}
class DatabaseLogs extends React.Component {
  render() {
    const database = this.props.data;
    return (
      <div className="log-container transScrollbar" id="database" style={ this.props.style }>
        <div className="logs transScrollbar" id="database-logs">
          <div className="log-info"><div className="log-info-name">Database</div></div>
          <div className={`database-log-data`}>
            <div className="database-log">Type</div>
            <div className="database-log">ClanID</div>
            <div className="database-log">GuildID</div>
            <div className="database-log">MembershipID</div>
            <div className="database-log">DisplayName</div>
            <div className="database-log">Broadcast</div>
            <div className="database-log">Count</div>
            <div className="database-log">Date</div>
          </div>
          { database.map((log) => { return this.props.buildBroadcast(log, "database") }) }
        </div>
      </div>
    )
  }
}
class ErrorLogs extends React.Component {
  render() {
    const errorHandler = this.props.data;
    return (
      <div className="log-container transScrollbar" id="errorHandler" style={ this.props.style }>
        <div className="logs transScrollbar" id="errorHandler-logs">
          <div className="log-info"><div className="log-info-name">Errors</div></div>
          { errorHandler.map((log) => { return this.props.buildLog(log, "errorHandler") }) }
        </div>
      </div>
    )
  }
}
class UserInterface extends React.Component {
  render() {
    const user = this.props.user;
    return (
      <div className="user-interface" style={{ background: `var(--${ this.props.currentBackground })` }}>
        <div className="user-interface-head"><div id="user-interface-id">{ user }</div><span onClick={(() => this.props.closeUserInterface())}>X</span></div>
        <div className="user-interface-body">
          
        </div>
      </div>
    )
  }
}

export default Logs;