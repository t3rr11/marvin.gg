import React, { Component, PureComponent } from 'react';
import { XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import * as apiRequest from '../modules/requests/API';

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
    apiStatus: []
  }
  
  componentDidMount() {
    this.setState({ status: { status: 'startUp', statusText: `Getting Live Graphs...`, loading: true } });
    this.CheckAuthorization();
  }

  componentWillUnmount() { clearInterval(graphUpdateTimer); graphUpdateTimer = null; }

  filterOutliers(someArray) {

    if(someArray.length < 4)
      return someArray;
  
    let values, q1, q3, iqr, maxValue, minValue;
  
    values = someArray.slice().sort( (a, b) => a - b);//copy array fast and sort
  
    if((values.length / 4) % 1 === 0){//find quartiles
      q1 = 1/2 * (values[(values.length / 4)] + values[(values.length / 4) + 1]);
      q3 = 1/2 * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1]);
    } else {
      q1 = values[Math.floor(values.length / 4 + 1)];
      q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
    }
  
    iqr = q3 - q1;
    maxValue = q3 + iqr * 1.5;
    minValue = q1 - iqr * 1.5;
  
    return values.filter((x) => (x >= minValue) && (x <= maxValue));
  }

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
    let frontend = []; let backend = [];

    await Promise.all([
      await apiRequest.GetWeeklyFrontendStatus(),
      await apiRequest.GetWeeklyBackendStatus()
    ])
    .then((response) => {
      let frontendData = response[0].data.reverse();
      let backendData = response[1].data.reverse();

      //Format the data
      frontendData.map((e, index) => {
        if(index > 0) {
          frontend.push({
            users: e.users,
            servers: e.servers,
            commandsInput: (e.commandsInput - frontendData[index-1].commandsInput) > 0 ? (e.commandsInput - frontendData[index-1].commandsInput) : 0,
            uptime: e.uptime,
            date: new Date(e.date).toLocaleString("en-AU")
          });
        }
      });
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
    });

    //Setup data updating
    setTimeout(() => {
      this.UpdateGraphs();
      if(graphUpdateTimer === null) { graphUpdateTimer = setInterval(() => { this.UpdateGraphs(); }, 1000 * 60 * 60); }
    }, 3660000 - new Date().getTime() % 3660000);

    //Save state
    this.setState({ status: { status: 'ready', statusText: `Finished Updating Graphs.`, loading: false }, frontend, backend });
  }

  render() {
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error error={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content">

          <AreaChart width={600} height={200} data={ this.state.frontend } margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" interval={100} domain={['auto', 'auto']} tick={ <CustomizedDateAxisTick /> } />
            <YAxis style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} />
            <Tooltip labelStyle={{ color: "black" }} wrapperStyle={{ fontSize: "12px", padding: "5px" }} />
            <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
          </AreaChart>

          <AreaChart width={600} height={200} data={ this.state.frontend } margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCommandsInput" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" interval={100} domain={['auto', 'auto']} tick={ <CustomizedDateAxisTick /> } />
            <YAxis style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} />
            <Tooltip labelStyle={{ color: "black" }} wrapperStyle={{ fontSize: "12px", padding: "5px" }} />
            <Area type="monotone" dataKey="commandsInput" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCommandsInput)" />
          </AreaChart>

          <AreaChart width={600} height={200} data={ this.state.frontend } margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorServers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#84d5d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#84d5d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" interval={100} domain={['auto', 'auto']} tick={ <CustomizedDateAxisTick /> } />
            <YAxis style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} />
            <Tooltip labelStyle={{ color: "black" }} wrapperStyle={{ fontSize: "12px", padding: "5px" }} />
            <Area type="monotone" dataKey="servers" stroke="#84d5d8" fillOpacity={1} fill="url(#colorServers)" />
          </AreaChart>

          <AreaChart width={600} height={200} data={ this.state.backend } margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
            <XAxis dataKey="date" interval={75} domain={['auto', 'auto']} tick={ <CustomizedDateAxisTick /> } />
            <YAxis yAxisId={1} style={{ fontSize: "12px", fill: "#d6d6d6" }} domain={['dataMin', 'dataMax']} />
            <YAxis yAxisId={2} orientation="right" style={{ fontSize: "12px", fill: "#d6d6d6" }} ticks={[0,5,10,20,50]} />
            <Tooltip labelStyle={{ color: "black" }} wrapperStyle={{ fontSize: "12px", padding: "5px" }} />
            <Area yAxisId={1} type="monotone" dataKey="total_clans" stroke="#3868b2" fillOpacity={1} fill="url(#colorClans)" />
            <Area yAxisId={2} type="monotone" dataKey="rt_clans" stroke="#3868b2" fillOpacity={1} fill="url(#colorRTClans)" />
          </AreaChart>

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

export default Graphs;