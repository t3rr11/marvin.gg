import React, { Component, PureComponent } from 'react';
import { XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import * as apiRequest from '../modules/requests/API';
import * as misc from '../Misc';

let graphUpdateTimer = null;

class Graphs extends React.Component {

  state = {
    status: {
      status: 'startUp',
      statusText: 'Getting ready!',
      error: null,
      loading: true
    },
    backend: [],
    frontend: [],
    timeLogs: [],
    apiStatus: []
  }
  
  componentDidMount() {
    this.setState({ status: { status: 'startUp', statusText: `Getting Live Graphs...`, loading: true } });
    this.CheckAuthorization();
  }
  componentWillUnmount() { clearInterval(graphUpdateTimer); graphUpdateTimer = null; }

  async CheckAuthorization() {
    const adminToken = localStorage.getItem("adminToken");
    if(adminToken) {
      await apiRequest.CheckAuthorization({ token: adminToken }).then((response) => {
        if(response.code === 200) {
          if(this.state.status.status === "startUp") { this.UpdateGraphs(); }
          setTimeout(() => this.CheckAuthorization(), 1000 * 60);
        }
        else { window.location.href = "/"; }
      });
    }
    else { window.location.href = "/"; }
  }

  async UpdateGraphs() {
    let frontend = []; let backend = []; let timeLogs = [];

    await Promise.all([
      await apiRequest.GetWeeklyFrontendStatus(),
      await apiRequest.GetWeeklyBackendStatus(),
      await apiRequest.GetRealtimeScanTimeLogs(),
      await apiRequest.GetNormalScanTimeLogs()
    ])
    .then((response) => {
      let frontendData = response[0].data.reverse();
      let backendData = response[1].data.reverse();
      let rtScanData = response[2].data.reverse();
      let normalScanData = response[3].data.reverse();

      //Format the data
      frontend = {
        users: frontendData.map((e, index) => { return { users: e.users, date: new Date(e.date).toLocaleString("en-AU") } }),
        servers: frontendData.map((e, index) => { return { servers: e.servers, date: new Date(e.date).toLocaleString("en-AU") } }),
        commandsInput: frontendData.map((e, index) => { return { commandsInput: e.commandsInput, date: new Date(e.date).toLocaleString("en-AU") } }).slice(frontendData.length-168, frontendData.length),
        uptime: frontendData.map((e, index) => { return { uptime: e.uptime, date: new Date(e.date).toLocaleString("en-AU") } })
      }

      backendData.map((e, index) => {
        if(index > 0) {
          backend.push({
            clans: e.clans,
            rt_clans: e.rt_clans,
            total_clans: e.clans + e.rt_clans,
            date: new Date(e.date).toLocaleString("en-AU")
          });
        }
      });

      timeLogs = {
        realtime: this.mAvgMapData(rtScanData, 10),
        normal: normalScanData.map((e, index) => { return { players: e.players, time: e.time, date: e.date } })
      }
    });

    //Setup data updating
    setTimeout(() => {
      this.UpdateGraphs();
      if(graphUpdateTimer === null) { graphUpdateTimer = setInterval(() => { this.UpdateGraphs(); }, 1000 * 60 * 60); }
    }, 3660000 - new Date().getTime() % 3660000);

    //Save state
    this.setState({ status: { status: 'ready', statusText: `Finished Updating Graphs.`, loading: false }, frontend, backend, timeLogs });
  }

  avgMapData = (data, variable, amount) => {
    let returnData = [];
    let total = 0;
    data.map((e, index) => {
      if(index % amount === 0) {
        total += parseInt(e[variable]);
        returnData.push({ [variable]: Math.round(parseInt(total) / amount), date: e.date });
        total = 0;
      } else { total += parseInt(e[variable]); }
    });
    return returnData;
  }
  mAvgMapData = (data, amount) => {
    let returnData = [];
    let totalTime = 0;
    let totalPlayers = 0;
    data.map((e, index) => {
      if(index % amount === 0) {
        totalTime += parseInt(e.time);
        totalPlayers += parseInt(e.players);
        returnData.push({ time: Math.round(parseInt(totalTime) / amount), players: Math.round(parseInt(totalPlayers) / amount), date: e.date });
        totalTime = 0;
        totalPlayers = 0;
      } else {
        totalTime += parseInt(e.time);
        totalPlayers += parseInt(e.players);
      }
    });
    return returnData;
  }
  compareData = (data, variable, amount) => {
    let returnData = [];
    let total = 0;
    let prevTotal = 0;
    data.map((e, index) => {
      if(index % amount === 0) {
        total += parseInt(e[variable]);
        returnData.push({
          [variable]: parseInt(total)-parseInt(prevTotal) > 0 ? parseInt(total)-parseInt(prevTotal) : 0,
          date: new Date(e.date).toLocaleString("en-AU")
        });
        prevTotal = total;
        total = 0;
      } else { total += parseInt(e[variable]); }
    });
    return returnData;
  }
  formatTime = (TimeinSeconds) => {
    var days, hours, minutes, seconds;
  
    seconds = Math.floor(Number(TimeinSeconds));
    days     = Math.floor(seconds / (24*60*60));
    seconds -= Math.floor(days    * (24*60*60));
    hours    = Math.floor(seconds / (60*60));
    seconds -= Math.floor(hours   * (60*60));
    minutes  = Math.floor(seconds / (60));
    seconds -= Math.floor(minutes * (60));
  
    var dDisplay, hDisplay, mDisplay, sDisplay;
  
    dDisplay = days > 0 ? days + (days == 1 ? 'd ' : 'd ') : '';
    hDisplay = hours > 0 ? hours + (hours == 1 ? 'h ' : 'h ') : '';
    mDisplay = minutes > 0 ? minutes + (minutes == 1 ? 'm ' : 'm ') : '';
    sDisplay = seconds > 0 ? seconds + (seconds == 1 ? 's ' : 's ') : '';
  
    if (TimeinSeconds < 60) { return sDisplay; }
    if (TimeinSeconds >= 60 && TimeinSeconds < 3600) { return mDisplay + sDisplay; }
    if (TimeinSeconds >= 3600 && TimeinSeconds < 86400) { return hDisplay + mDisplay; }
    if (TimeinSeconds >= 86400 && TimeinSeconds !== Infinity) { return dDisplay; }
    return dDisplay + hDisplay + mDisplay + sDisplay;
  }

  render() {
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error error={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content">
          <div className="graphs" style={{ display: "grid", gridTemplateColumns: "auto auto auto" }}>
            <AreaChart width={550} height={200} data={ this.state.frontend.users } margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" domain={['auto', 'auto']} tick={ <CustomizedDateAxisTick /> } />
              <YAxis style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} />
              <Tooltip labelStyle={{ color: "black" }} wrapperStyle={{ fontSize: "12px", padding: "5px" }} />
              <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
            <AreaChart width={550} height={200} data={ this.state.frontend.servers } margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorServers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84d5d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#84d5d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" domain={['auto', 'auto']} tick={ <CustomizedDateAxisTick /> } />
              <YAxis style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} />
              <Tooltip labelStyle={{ color: "black" }} wrapperStyle={{ fontSize: "12px", padding: "5px" }} />
              <Area type="monotone" dataKey="servers" stroke="#84d5d8" fillOpacity={1} fill="url(#colorServers)" />
            </AreaChart>
            <AreaChart width={550} height={200} data={ this.state.backend } margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3868b2" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3868b2" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRTClans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3868b2" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#3868b2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" domain={['auto', 'auto']} tick={ <CustomizedDateAxisTick /> } />
              <YAxis yAxisId={1} style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} />
              <YAxis yAxisId={2} orientation="right" style={{ fontSize: "12px", fill: "#d6d6d6" }} ticks={[0,5,10,20,50]} />
              <Tooltip labelStyle={{ color: "black" }} wrapperStyle={{ fontSize: "12px", padding: "5px" }} />
              <Area yAxisId={1} type="monotone" dataKey="total_clans" stroke="#3868b2" fillOpacity={1} fill="url(#colorClans)" />
              <Area yAxisId={2} type="monotone" dataKey="rt_clans" stroke="#3868b2" fillOpacity={1} fill="url(#colorRTClans)" />
            </AreaChart>
            <AreaChart width={550} height={200} data={ this.state.frontend.commandsInput } margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCommandsInput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" interval={48} domain={['auto', 'auto']} tick={ <CustomizedDateAxisTick /> } />
              <YAxis style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} />
              <Tooltip labelStyle={{ color: "black" }} wrapperStyle={{ fontSize: "12px", padding: "5px" }} />
              <Area type="monotone" dataKey="commandsInput" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCommandsInput)" />
            </AreaChart>
            <AreaChart width={550} height={200} data={ this.state.timeLogs.realtime } margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRTPlayers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1ABD57" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#1ABD57" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRTTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2BB7D0" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2BB7D0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" interval={60} domain={['auto', 'auto']} tick={ <CustomizedTimeAxisTick /> } />
              <YAxis yAxisId={1} orientation="right" style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} />
              <YAxis yAxisId={2} style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} tickFormatter={ (label) => `${ this.formatTime(label/1000) }` } />
              <Tooltip labelStyle={{ color: "black" }} wrapperStyle={{ fontSize: "12px", padding: "5px" }} />
              <Area yAxisId={1} type="monotone" dataKey="players" stroke="#1ABD57" fillOpacity={1} fill="url(#colorRTPlayers)" />
              <Area yAxisId={2} type="monotone" dataKey="time" stroke="#2BB7D0" fillOpacity={1} fill="url(#colorRTTime)" />
            </AreaChart>
            <AreaChart width={550} height={200} data={ this.state.timeLogs.normal } margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNormalPlayers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1ABD57" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#1ABD57" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNormalTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2BB7D0" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2BB7D0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" interval={60} domain={['auto', 'auto']} tick={ <CustomizedTimeAxisTick /> } />
              <YAxis yAxisId={1} orientation="right" style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} />
              <YAxis yAxisId={2} style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} tickFormatter={ (label) => `${ this.formatTime(label/1000) }` } />
              <Tooltip labelStyle={{ color: "black" }} wrapperStyle={{ fontSize: "12px", padding: "5px" }} />
              <Area yAxisId={1} type="monotone" dataKey="players" stroke="#1ABD57" fillOpacity={1} fill="url(#colorNormalPlayers)" />
              <Area yAxisId={2} type="monotone" dataKey="time" stroke="#2BB7D0" fillOpacity={1} fill="url(#colorNormalTime)" />
            </AreaChart>
          </div>
        </div>
      );
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

class CustomizedDateAxisTick extends PureComponent {
  render() {
    const { x, y, stroke, payload } = this.props;
    return (<g transform={`translate(${x},${y})`}><text x={0} y={0} dy={16} textAnchor="right" style={{ fontSize: "12px", fill: "#d6d6d6" }}>{ payload.value.split(',')[0] }</text></g>);
  }
}

class CustomizedTimeAxisTick extends PureComponent {
  render() {
    const { x, y, stroke, payload } = this.props;
    return (<g transform={`translate(${x},${y})`}><text x={0} y={0} dy={16} textAnchor="right" style={{ fontSize: "12px", fill: "#d6d6d6" }}>{ new Date(payload.value).toLocaleTimeString("en-UK") }</text></g>);
  }
}

export default Graphs;