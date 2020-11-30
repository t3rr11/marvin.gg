import React, { useEffect, useRef } from 'react';
import { XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, AreaSeries } from 'react-vis';
import ReactTooltip from 'react-tooltip';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import { formatSmallTime } from '../modules/Misc';
import * as apiRequest from '../modules/API';

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
          await apiRequest.GetBroadcastLogs({ date: frontendStartup.data[0].date }),
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
              database: log_data[3].data.concat(log_data[4].data).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
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
    let broadcast_logs = await apiRequest.GetBroadcastLogs({ date: this.state.lastUpdate });
    if(!logs?.isError) {
      if(logs.data.length > 0 || broadcast_logs.data.length > 0) {
        let { frontend, backend, express, database, globals, errorHandler } = this.state.logs;
        let startupDetected = false;
        for(let i in broadcast_logs.data) { database.unshift(broadcast_logs.data[i]); }
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

  render() {
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error statusText={ statusText } />) }
    else if(status === "ready") {
      const { frontend, backend, express, database, globals, errorHandler } = this.state.logs;
      const buildLog = (log, type) => {
        return (
          <div className={`${ type }-log-data`}>
            <div className={`${ log.type }-log`}>{ log.type }</div>
            <div className={`${ log.type }-log`}>{ log.log }</div>
            <div className={`${ log.type }-log`}>{ new Date(log.date).toLocaleString("en-AU") }</div>
          </div>
        );
      }
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          <h2 className="logs-page-title">Marvins Logs</h2>
          <div className="logs-container">
            <div className="log-container" id="backend">
              <div className="log-info">
                <div className="log-info-name">Backend</div>
              </div>
              <div className="logs scrollbar" id="backend-logs">{ backend.map((log) => { return buildLog(log, "backend") }) }</div>
            </div>
            <div className="log-container" id="frontend">
              <div className="log-info">
                <div className="log-info-name">Frontend</div>
              </div>
              <div className="logs scrollbar" id="frontend-logs">{ frontend.map((log) => { return buildLog(log, "frontend") }) }</div>
            </div>
            <div className="log-container" id="express">
              <div className="log-info">
                <div className="log-info-name">Express</div>
              </div>
              <div className="logs scrollbar" id="express-logs">{ express.map((log) => { return buildLog(log, "express") }) }</div>
            </div>
            <div className="log-container" id="globals">
              <div className="log-info">
                <div className="log-info-name">Globals</div>
              </div>
              <div className="logs scrollbar" id="globals-logs">{ globals.map((log) => { return buildLog(log, "globals") }) }</div>
            </div>
            <div className="log-container" id="database">
              <div className="log-info">
                <div className="log-info-name">Database</div>
              </div>
              <div className="logs scrollbar" id="database-logs">{ database.map((log) => { return buildLog(log, "database") }) }</div>
            </div>
            <div className="log-container" id="errorHandler">
              <div className="log-info">
                <div className="log-info-name">Errors</div>
              </div>
              <div className="logs scrollbar" id="errorHandler-logs">{ errorHandler.map((log) => { return buildLog(log, "errorHandler") }) }</div>
            </div>
          </div>
        </div>
      )
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

export default Logs;