import React, { Component } from 'react';
import Loader from '../modules/Loader';
import Error from '../modules/Error';
import * as Misc from '../Misc';
import Config from '../Config.json';
import SoTExample from '../assets/jsons/sot_example.json';

let refreshTimer = null;

export class SoT extends Component {

  state = {
    rat: "",
    error: false,
    loaded: false,
    updating: false,
    isFiltered: false,
    checked: [],
    timerRefresh: null,
    seasonData: { }
  }

  componentDidMount() {
    if(localStorage.getItem("checked")) { this.setState({ checked: JSON.parse(localStorage.getItem("checked")) }); }
    else { localStorage.setItem("checked", JSON.stringify([])) }
    if(localStorage.getItem("rat")) { this.setState({ rat: localStorage.getItem("rat") }) }
    this.startTimer();
    this.load(false);
  }

  componentWillUnmount() { this.clearTimer(); }

  startTimer() { if(refreshTimer === null) { refreshTimer = setInterval(() => this.load(true), 60000); } }
  clearTimer() { clearInterval(refreshTimer); refreshTimer = null; }

  saveRat(event) { 
    this.setState({ rat: event.target.value });
    localStorage.setItem("rat", event.target.value);
  }

  async load(updating) {
    if(localStorage.getItem("rat")) {
      this.startTimer();
      this.setState({ loaded: false, updating, error: false });
      this.getSeasonData(localStorage.getItem("rat"), (data) => {
        if(!data.isError) { this.setState({ loaded: true, seasonData: data.Data, timerRefresh: new Date() }); }
        else {
          if(data.Data === "Did not recieve json") { this.setState({ loaded: false, error: true }); }
          else {
            this.clearTimer();
            this.setState({ loaded: false, error: true, seasonData: "Expired rat" });
          }
        }
      });
    }
    else {
      console.log("Using Dummy Data");
      this.getDummySeasonData(this.state.rat, (data) => {
        if(!data.isError) { this.setState({ loaded: true, seasonData: data.Data.Data }); }
        else { this.setState({ loaded: false, error: true }); }
      });
    }
  }

  async getSeasonData(rat, callback) {
    return await fetch(`${ process.env.NODE_ENV === "development" ? "http://10.1.1.14:3002" : Config.localIP }/SeasonProgress?rat=${encodeURI(rat)}`, { headers: { 'Content-Type': 'application/json' } }).then(async (request) => {
      try {
        const response = await request.text();
        if(Misc.isJSON(response)) {
          const res = JSON.parse(response);
          if(request.ok && res.ErrorCode && res.ErrorCode !== 1) { callback({ "isError": true, "Data": res }) }
          else if(request.ok) { callback({ "isError": res.isError, "Data": res.Data }) }
          else { callback({ "isError": true, "Data": res }) }
        } else { callback({ "isError": true, "Data": "Did not recieve json" }) }
      } catch (err) { callback({ "isError": true, "Data": err }) } 
    }).catch((err) => { callback({ "isError": true, "Data": err }) });
  }

  async getDummySeasonData(rat, callback) {
    callback({ isError: false, "Data": SoTExample.Data });
  }

  render() {
    return(
      <div className="page-content" style={{ overflow: "hidden" }}>
        <div className="sot-page-header">
          <input id="rat" onChange={ (event) => this.saveRat(event) } value={ localStorage.getItem("rat") ? localStorage.getItem("rat") : "" }></input>
          <button value="Load" onClick={ (() => this.load(false)) }>Load</button>
          <div className="filterContainer">
            <input type="checkbox" name="filter" value="filter" checked={ this.state.isFiltered } onChange={ (() => this.setState({ isFiltered: !this.state.isFiltered })) } />
            <div>Filter Completed</div>
          </div>
        </div>
        {
          this.state.error ? <Error error={ this.state.seasonData === "Expired rat" ? "You're rat has expired, go grab another." : this.state.seasonData } /> :
          this.state.updating ? <GenerateTasks loggedIn={ this.state.rat ? true : false } isFiltered={ this.state.isFiltered } seasonData={ this.state.seasonData } /> :
          this.state.loaded ? <GenerateTasks loggedIn={ this.state.rat ? true : false } isFiltered={ this.state.isFiltered } seasonData={ this.state.seasonData } /> : <Loader statusText="Loading tasks..." />
        }
      </div>
    );
  }
}

class GenerateTasks extends Component {
  render() {
    return (
      <div className="sot-seasonal-container transScrollbar">
        { this.props.seasonData.ChallengeGroups.map((group) => { return <Group loggedIn={ this.props.loggedIn } isFiltered={ this.props.isFiltered } data={ group } /> }) }
      </div>
    );
  }
}

class Group extends Component {
  render() {
    const group = this.props.data;
    return (
      <div className="sot-category">
        <div className="sot-category-info">
          <div className="sot-category-title">{ group.Title }</div>
        </div>
        <div className="sot-category-challenges">
          { group.Challenges.map((challenge) => { return <Challenge loggedIn={ this.props.loggedIn } isFiltered={ this.props.isFiltered } data={ challenge } /> }) }
        </div>
      </div>
    );
  }
}

class Challenge extends Component {
  render() {
    const challenge = this.props.data;
    const goals = challenge.Goals;
    if(this.props.isFiltered) {
      const filteredGoals = challenge.Goals.filter(e => e.ProgressValue !== e.Threshold);
      if(filteredGoals.length > 0) {
        return (
          <div className="sot-challenge">
            <div className="sot-challenge-title">{ challenge.Title }</div>
            { filteredGoals.map((goal) => { return <Goal loggedIn={ this.props.loggedIn } isFiltered={ this.props.isFiltered } challenge={ challenge } data={ goal } /> }) }
          </div>
        )
      }
      else { return ("") }
    }
    else {
      return (
        <div className="sot-challenge">
          <div className="sot-challenge-title">{ challenge.Title }</div>
          { goals.map((goal) => { return <Goal loggedIn={ this.props.loggedIn } isFiltered={ this.props.isFiltered } challenge={ challenge } data={ goal } /> }) }
        </div>
      )
    }
  }
}

class Goal extends Component {
  render() {
    const goal = this.props.data;
    const threshold = goal.Threshold;
    const progress = goal.ProgressValue;
    const progressRatio = (progress / threshold).toFixed(2) * 100;
    const checked = progress === threshold;
    return (
      <div className="sot-goal">
        <input type="checkbox" name={ goal.Title } value={ goal.Title } checked={ checked } readOnly={true} />
        <div className="sot-goal-title">{ goal.Title }</div>
        {
          progress !== undefined && threshold > 1 ? (
            <div className="progress">
              <div className="progress-bar" role="progressbar" style={{ width: `${ progressRatio }%` }} aria-valuenow={ progress } aria-valuemin="0" aria-valuemax={ threshold }>
                { progress } / { threshold }
              </div>
            </div>
          ) : ""
        }
      </div>
    )
  }
}




export default SoT;