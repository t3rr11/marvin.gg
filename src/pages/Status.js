import React from 'react';
import { XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, AreaSeries } from 'react-vis';
import ReactTooltip from 'react-tooltip';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import { formatSmallTime } from '../modules/Misc';
import * as apiRequest from '../modules/API';

let updateTimer = null;
let updateAPIStatusTimer = null;

class Status extends React.Component {
  state = {
    status: {
      status: 'startUp',
      statusText: 'Getting ready!',
      error: null,
      loading: true
    },
    backendData: {
      index: [],
      rt_index: [],
      clans: [],
      rt_clans: [],
      processing: [],
      rt_processing: [],
      uptime: [],
      speed: [],
      APIStatus: [],
      APIFaults: 0
    },
    frontendData: {
      users: [],
      servers: [],
      commandsInput: [],
      uptime: []
    }
  }

  componentDidMount() {
    this.setState({ status: { status: 'startUp', statusText: `Getting Live Analytics...`, loading: true } });
    this.CheckAuthorization();
  }

  componentWillUnmount() { clearInterval(updateTimer); updateTimer = null; clearInterval(updateAPIStatusTimer); updateAPIStatusTimer = null; }

  async CheckAuthorization() {
    const adminToken = localStorage.getItem("adminToken");
    if(adminToken) {
      await apiRequest.CheckAuthorization({ token: adminToken }).then((response) => {
        if(response.code === 200) {
          if(this.state.status.status === "startUp") { this.SetupAnalytics(); }
          setTimeout(() => this.CheckAuthorization(), 1000 * 60);
        }
        else { window.location.href = "/"; }
      });
    }
    else { window.location.href = "/"; }
  }
  async SetupAnalytics() {
    let backend; let frontend; let apiStatus;

    await Promise.all([await apiRequest.GetBackendStatusHistory(), await apiRequest.GetFrontendStatusHistory(), await apiRequest.GetDailyAPIStatus()]).then((response) => {
      backend = response[0];
      frontend = response[1];
      apiStatus = response[2];
    });

    if(!backend?.isError && !frontend?.isError && !apiStatus?.isError) {
      //Define variables
      let index = [], rt_index = [], clans = [], rt_clans = [], processing = [], rt_processing = [], backend_uptime = [], speed = []; 
      let users = [], servers = [], commandsInput = [], frontend_uptime = [];
      let APIFaults = { logs: 0, faults: 0 };
      let hours = new Date().getHours();
      let APIStatus = {
        0: { id: 0, faults: 0, defined: false, time: "12-1am", date : null, offset: 0-hours > 0 ? 0-hours-24 : 0-hours }, 
        1: { id: 1, faults: 0, defined: false, time: "1-2am", date: null, offset: 1-hours > 0 ? 1-hours-24 : 1-hours }, 
        2: { id: 2, faults: 0, defined: false, time: "2-3am", date: null, offset: 2-hours > 0 ? 2-hours-24 : 2-hours }, 
        3: { id: 3, faults: 0, defined: false, time: "3-4am", date: null, offset: 3-hours > 0 ? 3-hours-24 : 3-hours }, 
        4: { id: 4, faults: 0, defined: false, time: "4-5am", date: null, offset: 4-hours > 0 ? 4-hours-24 : 4-hours }, 
        5: { id: 5, faults: 0, defined: false, time: "5-6am", date: null, offset: 5-hours > 0 ? 5-hours-24 : 5-hours }, 
        6: { id: 6, faults: 0, defined: false, time: "6-7am", date: null, offset: 6-hours > 0 ? 6-hours-24 : 6-hours },
        7: { id: 7, faults: 0, defined: false, time: "7-8am", date: null, offset: 7-hours > 0 ? 7-hours-24 : 7-hours }, 
        8: { id: 8, faults: 0, defined: false, time: "8-9am", date: null, offset: 8-hours > 0 ? 8-hours-24 : 8-hours }, 
        9: { id: 9, faults: 0, defined: false, time: "9-10am", date: null, offset: 9-hours > 0 ? 9-hours-24 : 9-hours }, 
        10: { id: 10, faults: 0, defined: false, time: "10-11am", date: null, offset: 10-hours > 0 ? 10-hours-24 : 10-hours }, 
        11: { id: 11, faults: 0, defined: false, time: "11am-12pm", date: null, offset: 11-hours > 0 ? 11-hours-24 : 11-hours }, 
        12: { id: 12, faults: 0, defined: false, time: "12-1pm", date: null, offset: 12-hours > 0 ? 12-hours-24 : 12-hours },
        13: { id: 13, faults: 0, defined: false, time: "1-2pm", date: null, offset: 13-hours > 0 ? 13-hours-24 : 13-hours }, 
        14: { id: 14, faults: 0, defined: false, time: "2-3pm", date: null, offset: 14-hours > 0 ? 14-hours-24 : 14-hours }, 
        15: { id: 15, faults: 0, defined: false, time: "3-4pm", date: null, offset: 15-hours > 0 ? 15-hours-24 : 15-hours }, 
        16: { id: 16, faults: 0, defined: false, time: "4-5pm", date: null, offset: 16-hours > 0 ? 16-hours-24 : 16-hours }, 
        17: { id: 17, faults: 0, defined: false, time: "5-6pm", date: null, offset: 17-hours > 0 ? 17-hours-24 : 17-hours }, 
        18: { id: 18, faults: 0, defined: false, time: "6-7pm", date: null, offset: 18-hours > 0 ? 18-hours-24 : 18-hours },
        19: { id: 19, faults: 0, defined: false, time: "7-8pm", date: null, offset: 19-hours > 0 ? 19-hours-24 : 19-hours }, 
        20: { id: 20, faults: 0, defined: false, time: "8-9pm", date: null, offset: 20-hours > 0 ? 20-hours-24 : 20-hours },
        21: { id: 21, faults: 0, defined: false, time: "9-10pm", date: null, offset: 21-hours > 0 ? 21-hours-24 : 21-hours },
        22: { id: 22, faults: 0, defined: false, time: "10-11pm", date: null, offset: 22-hours > 0 ? 22-hours-24 : 22-hours },
        23: { id: 23, faults: 0, defined: false, time: "11pm-12am", date: null, offset: 23-hours > 0 ? 23-hours-24 : 23-hours }
      };

      //Add new data
      const liveBackendData = backend.data.reverse();
      const liveFrontendData = frontend.data.reverse();
      const liveAPIStatusData = apiStatus.data.reverse();

      for(let i in liveBackendData) {
        index.push({ x: new Date(liveBackendData[i].date), y: liveBackendData[i].index });
        rt_index.push({ x: new Date(liveBackendData[i].date), y: liveBackendData[i].rt_index });
        clans.push({ x: new Date(liveBackendData[i].date), y: liveBackendData[i].clans });
        rt_clans.push({ x: new Date(liveBackendData[i].date), y: liveBackendData[i].rt_clans });
        processing.push({ x: new Date(liveBackendData[i].date), y: liveBackendData[i].processing });
        rt_processing.push({ x: new Date(liveBackendData[i].date), y: liveBackendData[i].rt_processing });
        backend_uptime.push({ x: new Date(liveBackendData[i].date), y: liveBackendData[i].uptime });
        speed.push({ x: new Date(liveBackendData[i].date), y: liveBackendData[i].speed });
      }

      for(let i in liveFrontendData) {
        users.push({ x: new Date(liveFrontendData[i].date), y: liveFrontendData[i].users });
        servers.push({ x: new Date(liveFrontendData[i].date), y: liveFrontendData[i].servers });
        commandsInput.push({ x: new Date(liveFrontendData[i].date), y: liveFrontendData[i].commandsInput });
        frontend_uptime.push({ x: new Date(liveFrontendData[i].date), y: liveFrontendData[i].uptime });
      }

      //Set loop index and go through and find faults.
      for(let i in liveAPIStatusData) {
        if(!APIStatus[new Date(liveAPIStatusData[i].date).getHours()].defined) { APIStatus[new Date(liveAPIStatusData[i].date).getHours()].defined = true; }
        if(!liveAPIStatusData[i].APIStatus) { APIStatus[new Date(liveAPIStatusData[i].date).getHours()].faults++; APIFaults.faults++; }
        APIStatus[new Date(liveAPIStatusData[i].date).getHours()].date = liveAPIStatusData[i].date;
        APIFaults.logs++;
      }

      //Save state
      this.setState({
        backendData: { index, rt_index, clans, rt_clans, processing, rt_processing, uptime: backend_uptime, speed, APIStatus, APIFaults },
        frontendData: { users, servers, commandsInput, uptime: frontend_uptime }
      });

      //Set Interval of Refresh
      if(updateTimer === null) { updateTimer = setInterval(() => { this.UpdateAnalytics(); }, 1000); }
      if(updateAPIStatusTimer === null) { updateAPIStatusTimer = setInterval(() => { this.UpdateAPIStatus(); }, 60000 ); }
    }
    else {
      //Save error state
      this.setState({ status: { status: 'error', statusText: `Error Loading Analytics. Server Offline. Re-checking in 5 seconds.`, loading: false } });
      setTimeout(() => this.SetupAnalytics(), 5000);
    }
  }
  async UpdateAnalytics() {
    let backend; let frontend;
    await Promise.all([await apiRequest.GetBackendStatus(), await apiRequest.GetFrontendStatus()]).then((response) => { backend = response[0]; frontend = response[1]; });

    if(!backend?.isError && !frontend?.isError) {
      const backendData = backend.data[0];
      const frontendData = frontend.data[0];
      
      //Grab previous logged data
      let { index, rt_index, clans, rt_clans, processing, rt_processing, speed, APIStatus, APIFaults } = this.state.backendData;
      let { users, servers, commandsInput } = this.state.frontendData;
      let backend_uptime = this.state.backendData.uptime;
      let frontend_uptime = this.state.frontendData.uptime;

      //Cap array at 1 minute
      if(index.length >= 300){ index.shift(); }
      if(rt_index.length >= 300){ rt_index.shift(); }
      if(clans.length >= 300){ clans.shift(); }
      if(rt_clans.length >= 300){ rt_clans.shift(); }
      if(processing.length >= 300){ processing.shift(); }
      if(rt_processing.length >= 300){ rt_processing.shift(); }
      if(backend_uptime.length >= 300){ backend_uptime.shift(); }
      if(speed.length >= 300){ speed.shift(); }
      if(users.length >= 300){ users.shift(); }
      if(servers.length >= 300){ servers.shift(); }
      if(commandsInput.length >= 300){ commandsInput.shift(); }
      if(frontend_uptime.length >= 300){ frontend_uptime.shift(); }

      //Add new data
      index.push({ x: new Date(backendData.date), y: backendData.index });
      rt_index.push({ x: new Date(backendData.date), y: backendData.rt_index });
      clans.push({ x: new Date(backendData.date), y: backendData.clans });
      rt_clans.push({ x: new Date(backendData.date), y: backendData.rt_clans });
      processing.push({ x: new Date(backendData.date), y: backendData.processing });
      rt_processing.push({ x: new Date(backendData.date), y: backendData.rt_processing });
      backend_uptime.push({ x: new Date(backendData.date), y: backendData.uptime });
      speed.push({ x: new Date(backendData.date), y: backendData.speed });
      users.push({ x: new Date(frontendData.date), y: frontendData.users });
      servers.push({ x: new Date(frontendData.date), y: frontendData.servers });
      commandsInput.push({ x: new Date(frontendData.date), y: frontendData.commandsInput });
      frontend_uptime.push({ x: new Date(frontendData.date), y: frontendData.uptime });

      //Save state
      this.setState({
        status: { status: 'ready', statusText: `Finished Updating Analytics.`, loading: false },
        backendData: { index, rt_index, clans, rt_clans, processing, rt_processing, uptime: backend_uptime, speed, APIStatus, APIFaults },
        frontendData: { users, servers, commandsInput, uptime: frontend_uptime }
      });
    }
  }
  async UpdateAPIStatus() {
    const apiStatus = await apiRequest.GetDailyAPIStatus();
    const liveAPIStatusData = apiStatus.data.reverse();

    let { index, rt_index, clans, rt_clans, processing, rt_processing, uptime, speed } = this.state.backendData;
    let hours = new Date().getHours();
    let APIFaults = { logs: 0, faults: 0 };
    let APIStatus = {
      0: { id: 0, faults: 0, defined: false, time: "12-1am", date : null, offset: 0-hours > 0 ? 0-hours-24 : 0-hours }, 
      1: { id: 1, faults: 0, defined: false, time: "1-2am", date: null, offset: 1-hours > 0 ? 1-hours-24 : 1-hours }, 
      2: { id: 2, faults: 0, defined: false, time: "2-3am", date: null, offset: 2-hours > 0 ? 2-hours-24 : 2-hours }, 
      3: { id: 3, faults: 0, defined: false, time: "3-4am", date: null, offset: 3-hours > 0 ? 3-hours-24 : 3-hours }, 
      4: { id: 4, faults: 0, defined: false, time: "4-5am", date: null, offset: 4-hours > 0 ? 4-hours-24 : 4-hours }, 
      5: { id: 5, faults: 0, defined: false, time: "5-6am", date: null, offset: 5-hours > 0 ? 5-hours-24 : 5-hours }, 
      6: { id: 6, faults: 0, defined: false, time: "6-7am", date: null, offset: 6-hours > 0 ? 6-hours-24 : 6-hours },
      7: { id: 7, faults: 0, defined: false, time: "7-8am", date: null, offset: 7-hours > 0 ? 7-hours-24 : 7-hours }, 
      8: { id: 8, faults: 0, defined: false, time: "8-9am", date: null, offset: 8-hours > 0 ? 8-hours-24 : 8-hours }, 
      9: { id: 9, faults: 0, defined: false, time: "9-10am", date: null, offset: 9-hours > 0 ? 9-hours-24 : 9-hours }, 
      10: { id: 10, faults: 0, defined: false, time: "10-11am", date: null, offset: 10-hours > 0 ? 10-hours-24 : 10-hours }, 
      11: { id: 11, faults: 0, defined: false, time: "11-12pm", date: null, offset: 11-hours > 0 ? 11-hours-24 : 11-hours }, 
      12: { id: 12, faults: 0, defined: false, time: "12-1pm", date: null, offset: 12-hours > 0 ? 12-hours-24 : 12-hours },
      13: { id: 13, faults: 0, defined: false, time: "1-2pm", date: null, offset: 13-hours > 0 ? 13-hours-24 : 13-hours }, 
      14: { id: 14, faults: 0, defined: false, time: "2-3pm", date: null, offset: 14-hours > 0 ? 14-hours-24 : 14-hours }, 
      15: { id: 15, faults: 0, defined: false, time: "3-4pm", date: null, offset: 15-hours > 0 ? 15-hours-24 : 15-hours }, 
      16: { id: 16, faults: 0, defined: false, time: "4-5pm", date: null, offset: 16-hours > 0 ? 16-hours-24 : 16-hours }, 
      17: { id: 17, faults: 0, defined: false, time: "5-6pm", date: null, offset: 17-hours > 0 ? 17-hours-24 : 17-hours }, 
      18: { id: 18, faults: 0, defined: false, time: "6-7pm", date: null, offset: 18-hours > 0 ? 18-hours-24 : 18-hours },
      19: { id: 19, faults: 0, defined: false, time: "7-8pm", date: null, offset: 19-hours > 0 ? 19-hours-24 : 19-hours }, 
      20: { id: 20, faults: 0, defined: false, time: "8-9pm", date: null, offset: 20-hours > 0 ? 20-hours-24 : 20-hours },
      21: { id: 21, faults: 0, defined: false, time: "9-10pm", date: null, offset: 21-hours > 0 ? 21-hours-24 : 21-hours },
      22: { id: 22, faults: 0, defined: false, time: "10-11pm", date: null, offset: 22-hours > 0 ? 22-hours-24 : 22-hours },
      23: { id: 23, faults: 0, defined: false, time: "11-12am", date: null, offset: 23-hours > 0 ? 23-hours-24 : 23-hours }
    };

    //Set loop index and go through and find faults.
    for(let i in liveAPIStatusData) {
      if(!APIStatus[new Date(liveAPIStatusData[i].date).getHours()].defined) { APIStatus[new Date(liveAPIStatusData[i].date).getHours()].defined = true; }
      if(!liveAPIStatusData[i].APIStatus) { APIStatus[new Date(liveAPIStatusData[i].date).getHours()].faults++; APIFaults.faults++; }
      APIStatus[new Date(liveAPIStatusData[i].date).getHours()].date = liveAPIStatusData[i].date;
      APIFaults.logs++;
    }

    //Save state
    this.setState({
      status: { status: 'ready', statusText: `Finished Updating Analytics.`, loading: false },
      backendData: { index, rt_index, clans, rt_clans, processing, rt_processing, uptime, speed, APIStatus, APIFaults }
    });
  }

  render() {
    const { index, rt_index, clans, rt_clans, processing, rt_processing, speed, APIStatus, APIFaults } = this.state.backendData;
    const { users, servers, commandsInput } = this.state.frontendData;
    const backend_uptime = this.state.backendData.uptime;
    const frontend_uptime = this.state.frontendData.uptime;
    const { status, statusText } = this.state.status;
    const onlineBox = (status) => {
      return (
        <div className="online-box" data-tip data-for={`${ status.id }-tooltip`}>
          <ReactTooltip id={`${ status.id }-tooltip`} place="top" effect="solid" backgroundColor="#2e842e">
            <div className="box-date">{ new Date(status.date).toLocaleDateString("en-AU", { year: 'numeric', month: 'long', day: 'numeric' }) } - { status.time }</div>
            <div>No faults detected</div>
          </ReactTooltip>
        </div>
      )
    }
    const warningBox = (status) => {
      return (
        <div className="warning-box" data-tip data-for={`${ status.id }-tooltip`}>
          <ReactTooltip id={`${ status.id }-tooltip`} place="top" effect="solid" backgroundColor="#b2b358">
            <div className="box-date">{ new Date(status.date).toLocaleDateString("en-AU", { year: 'numeric', month: 'long', day: 'numeric' }) } - { status.time }</div>
            <div>Some faults detected</div>
          </ReactTooltip>
        </div>
      )
    }
    const offlineBox = (status) => {
      return (
        <div className="offline-box" data-tip data-for={`${ status.id }-tooltip`}>
          <ReactTooltip id={`${ status.id }-tooltip`} place="top" effect="solid" backgroundColor="#bf4949">
            <div className="box-date">{ new Date(status.date).toLocaleDateString("en-AU", { year: 'numeric', month: 'long', day: 'numeric' }) } - { status.time }</div>
            <div>Major outage detected</div>
          </ReactTooltip>
        </div>
      )
    }
    if(status === "error") { return (<Error statusText={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content">
          <h2 className="status-page-title">Server Status</h2>
          <div className="status-info">
            <div className="status-info-category">
              <div className="status-info-title">Bungie API Status</div>
              <div className="status-info-data">
                {
                  Object.values(APIStatus).sort((a,b) => a.offset - b.offset).map((status) => {
                    if(status.defined) {
                      if(status.faults === 0) { return onlineBox(status); }
                      else if(status.faults > 43200) { return offlineBox(status); }
                      else { return warningBox(status); }
                    }
                    else { return offlineBox(status); }
                  })
                }
              </div>
              <div className="status-info-uptime">{ 100 - ((APIFaults.faults/APIFaults.logs) * 100).toFixed(2) }% UPTIME</div>
            </div>
            <div className="status-info-category">
              <div className="status-info-title">Marvin Backend Status - { formatSmallTime(backend_uptime[backend_uptime.length-1].y / 1000) }</div>
              <div className="status-info-data">
                {
                  Object.values(APIStatus).sort((a,b) => a.offset - b.offset).map((status) => {
                    if(status.defined) {
                      if(status.faults === 0) { return onlineBox(status); }
                      else if(status.faults > 43200) { return offlineBox(status); }
                      else { return warningBox(status); }
                    }
                    else { return offlineBox(status); }
                  })
                }
              </div>
              <div className="status-info-uptime">{ 100 - ((APIFaults.faults/APIFaults.logs) * 100).toFixed(2) }% UPTIME</div>
            </div>
            <div className="status-info-category">
              <div className="status-info-title">Marvin Frontend Status - { formatSmallTime(frontend_uptime[frontend_uptime.length-1].y / 1000) }</div>
              <div className="status-info-data">
                {
                  Object.values(APIStatus).sort((a,b) => a.offset - b.offset).map((status) => {
                    if(status.defined) {
                      if(status.faults === 0) { return onlineBox(status); }
                      else if(status.faults > 43200) { return offlineBox(status); }
                      else { return warningBox(status); }
                    }
                    else { return offlineBox(status); }
                  })
                }
              </div>
              <div className="status-info-uptime">{ 100 - ((APIFaults.faults/APIFaults.logs) * 100).toFixed(2) }% UPTIME</div>
            </div>
          </div>
          <div className="graph-container">
            <div className="graph" id="clans-graph">
              <div className="graph-title">Clans (1s Interval)</div>
              <div className="graph-data">
                <div>{ processing ? `Tracking: ${ clans[clans.length-1].y } Clans` : `Offline` }</div>
              </div>
              <XYPlot xType="time" width={ 550 } height={ 250 } yDomain={[0, Math.max.apply(Math, clans.map(function(o) { return o.y; }))+1]}>
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <HorizontalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Clans" />
                <AreaSeries data={ clans } color={ "#00a6ef" } fill={ "#1c5169" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph" id="index-graph">
              <div className="graph-title">Index (1s Interval)</div>
              <div className="graph-data">
                <div>{ index ? `Current Index: ${ index[index.length-1].y }` : `Offline` }</div>
              </div>
              <XYPlot xType="time" width={ 550 } height={ 250 } yDomain={[0, Math.max.apply(Math, index.map(function(o) { return o.y; }))+1]}>
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <HorizontalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Index" />
                <AreaSeries data={ index } color={ "#00a6ef" } fill={ "#1c5169" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph" id="processing-graph">
              <div className="graph-title">Processing (1s Interval)</div>
              <div className="graph-data">
                <div>{ processing ? `Currently Processing: ${ processing[processing.length-1].y }` : `Offline` }</div>
              </div>
              <XYPlot xType="time" width={ 550 } height={ 250 } yDomain={[0, Math.max.apply(Math, processing.map(function(o) { return o.y; }))+1]}>
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <HorizontalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Clans" />
                <AreaSeries data={ processing } color={ "#00a6ef" } fill={ "#1c5169" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph" id="rt_clans-graph">
              <div className="graph-title">RT Clans (1s Interval)</div>
              <div className="graph-data">
                <div>{ rt_clans ? `Tracking: ${ rt_clans[rt_clans.length-1].y } Clans` : `Offline` }</div>
              </div>
              <XYPlot xType="time" width={ 550 } height={ 250 } yDomain={[0, Math.max.apply(Math, rt_clans.map(function(o) { return o.y; }))+1]}>
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <HorizontalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Clans" />
                <AreaSeries data={ rt_clans } color={ "#00bbaf" } fill={ "#1b4d53" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph" id="rt_index-graph">
              <div className="graph-title">RT Index (1s Interval)</div>
              <div className="graph-data">
                <div>{ rt_index ? `Current Index: ${ rt_index[rt_index.length-1].y }` : `Offline` }</div>
              </div>
              <XYPlot xType="time" width={ 550 } height={ 250 } yDomain={[0, Math.max.apply(Math, rt_index.map(function(o) { return o.y; }))+1]}>
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <HorizontalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Index" />
                <AreaSeries data={ rt_index } color={ "#00bbaf" } fill={ "#1b4d53" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph" id="rt_processing-graph">
              <div className="graph-title">RT Processing (1s Interval)</div>
              <div className="graph-data">
                <div>{ rt_processing ? `Currently Processing: ${ rt_processing[processing.length-1].y }` : `Offline` }</div>
              </div>
              <XYPlot xType="time" width={ 550 } height={ 250 } yDomain={[0, Math.max.apply(Math, rt_processing.map(function(o) { return o.y; }))+1]}>
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <HorizontalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Clans" />
                <AreaSeries data={ rt_processing } color={ "#00bbaf" } fill={ "#1b4d53" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
          </div>
        </div>
      )
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

export default Status;