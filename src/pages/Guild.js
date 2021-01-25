import React, { Component, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import ClanBannerGenerator from '../modules/ClanBanner';
import * as API from '../modules/requests/API';
import * as bungieRequest from '../modules/requests/BungieReq';
import * as Manifest from '../modules/handlers/ManifestHandler';
import * as Misc from '../Misc';

export class Guild extends Component {

  state = {
    status: {
      status: 'startingUp',
      statusText: `Loading Guild`,
      loading: true
    },
    leaderboardType: null,
    highlightedUser: null, 
    guild: { },
    clans: { },
    users: { }
  }

  componentDidMount() {
    document.title = "Marvin - Guild";
    this.GetGuild();
  }

  GetGuild() {
    const path = this.props.props.location.pathname.split("/");
    if(path[2] && path[3]) {
      const guildID = path[2];
      const leaderboardType = path[3];
      const highlightedUser = Misc.getURLVars()["hl"];
      this.props.setSubPage(leaderboardType);
      API.GetGuildRankings({ guildID }, ({ isError, code, message, data }) => {
        if(!isError) {
          this.setState({ 
            status: { status: 'ready', statusText: `Finished loading`, loading: false },
            leaderboardType,
            highlightedUser,
            guild: data.guild,
            clans: data.clans,
            users: data.users,
          });
        }
        else { this.setState({ status: { status: 'error', statusText: message, loading: false } }); }
      });
    }
    else { this.setState({ status: { status: 'error', statusText: "Not enough params in URL", loading: false } }); }
  }

  render() {
    const { leaderboardType, highlightedUser, users, clans } = this.state;
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error error={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          <ServerRankings clans={clans} users={users.filter(e => !e.isPrivate)} leaderboardType={leaderboardType} highlightedUser={highlightedUser} currentSubPage={this.props.currentSubPage} />
        </div>
      );
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

class ServerRankings extends Component {

  state = {
    clans: [],
    users: [],
    leaderboardType: null,
    currentSubPage: null
  }

  componentDidMount() {
    this.setState({
      clans: this.props.clans,
      users: this.props.users,
      leaderboardType: this.props.leaderboardType,
      highlightedUser: this.props.highlightedUser, 
      currentSubPage: this.props.currentSubPage },
      (() => { this.generateRankings(); })
    );
  }

  componentDidUpdate() {
    if(this.props.currentSubPage !== this.state.currentSubPage) {
      const path = window.location.pathname.split("/");
      window.history.pushState({}, '', `/guild/${ path[2] }/${ this.props.currentSubPage }${ window.location.search }`);
      this.setState({
        clans: this.props.clans,
        users: this.props.users,
        leaderboardType: this.props.currentSubPage,
        highlightedUser: this.props.highlightedUser, 
        currentSubPage: this.props.currentSubPage },
        (() => { this.generateRankings(); })
      );
    }
  }

  generateRankings() {
    const { users, leaderboardType } = this.state;
    switch(true) {
      case leaderboardType === "valor": { users.sort((a, b) => b[leaderboardType].current - a[leaderboardType].current); break; }
      case leaderboardType === "infamy": { users.sort((a, b) => b[leaderboardType].current - a[leaderboardType].current); break; }
      case leaderboardType === "ironBanner": { users.sort((a, b) => b[leaderboardType].kills - a[leaderboardType].kills); break; }
      case leaderboardType === "activeScore": case leaderboardType === "legacyScore": case leaderboardType === "lifetimeScore": {
        users.sort((a, b) => b["triumphScore"][leaderboardType] - a["triumphScore"][leaderboardType]);
        break;
      }
      case leaderboardType === "levi": case leaderboardType === "eow": case leaderboardType === "sos": case leaderboardType === "lastWish": case leaderboardType === "scourge":
      case leaderboardType === "sorrows": case leaderboardType === "garden": case leaderboardType === "dsc": { users.sort((a, b) => b.raids[leaderboardType] - a.raids[leaderboardType]); break; }
      case leaderboardType === "pLevi": { users.sort((a, b) => b.raids["prestige_levi"] - a.raids["prestige_levi"]); break; }
      case leaderboardType === "pEoW": { users.sort((a, b) => b.raids["prestige_eow"] - a.raids["prestige_eow"]); break; }
      case leaderboardType === "pSoS": { users.sort((a, b) => b.raids["prestige_sos"] - a.raids["prestige_sos"]); break; }
      case leaderboardType === "shatteredThrone": case leaderboardType === "pitOfHeresy": case leaderboardType === "prophecy": {
        users.sort((a, b) => b["dungeons"][leaderboardType].completions - a["dungeons"][leaderboardType].completions);
        break;
      }
      default: { users.sort((a, b) => b[leaderboardType] - a[leaderboardType]); break; }
    }
    this.setState({ users });
  }

  getDataSet = (type) => {
    switch(true) {
      case type === "valor": { return { name: "Valor", value: ["Valor"] }; }
      case type === "glory": { return { name: "Glory", value: ["Glory"] }; }
      case type === "infamy": { return { name: "Infamy", value: ["Infamy"] }; }
      case type === "seasonRank": { return { name: "Season Rank", value: ["SR"] }; }
      case type === "timePlayed": { return { name: "Time Played", value: ["Hours"] }; }
      case type === "highestPower": { return { name: "Highest Power Level", value: ["Power Level"] }; }
      case type === "ironBanner": { return { name: "Iron Banner", value: ["Kills", "Wins"] }; }
      case type === "levi": { return { name: "Leviathan Clears", value: ["Clears"] }; }
      case type === "eow": { return { name: "Eater of Worlds Clears", value: ["Clears"] }; }
      case type === "sos": { return { name: "Spire of Stars Clears", value: ["Clears"] }; }
      case type === "pLevi": { return { name: "Prestige Leviathan Clears", value: ["Clears"] }; }
      case type === "pEoW": { return { name: "Prestige Eater of Worlds Clears", value: ["Clears"] }; }
      case type === "pSoS": { return { name: "Prestige Spire of Stars Clears", value: ["Clears"] }; }
      case type === "lastWish": { return { name: "Last Wish Clears", value: ["Clears"] }; }
      case type === "scourge": { return { name: "Scourge of the Past Clears", value: ["Clears"] }; }
      case type === "sorrows": { return { name: "Crown of Sorrows Clears", value: ["Clears"] }; }
      case type === "garden": { return { name: "Garden of Salvation Clears", value: ["Clears"] }; }
      case type === "dsc": { return { name: "Deep Stone Crypt Clears", value: ["Clears"] }; }
      case type === "totalRaids": { return { name: "Total Raids", value: ["Clears"] }; }
      case type === "activeScore": { return { name: "Triumph Score", value: ["Score"] }; }
      case type === "legacyScore": { return { name: "Legacy Triumph Score", value: ["Score"] }; }
      case type === "lifetimeScore": { return { name: "Lifetime Triumph Score", value: ["Score"] }; }
      default: { return { name: type, value: [type] }; }
    }
  }

  formatDataSet = (type, member) => {
    switch(true) {
      case type === "valor": { return [member[type].current] }
      case type === "infamy": { return [member[type].current] }
      case type === "timePlayed": { return [(member[type] / 60).toFixed(0)] }
      case type === "ironBanner": { return [member[type].kills, member[type].wins] }
      case type === "levi": { return [member.raids[type]] }
      case type === "eow": { return [member.raids[type]] }
      case type === "sos": { return [member.raids[type]] }
      case type === "pLevi": { return [member.raids["prestige_levi"]] }
      case type === "pEoW": { return [member.raids["prestige_eow"]] }
      case type === "pSoS": { return [member.raids["prestige_sos"]] }
      case type === "lastWish": { return [member.raids[type]] }
      case type === "scourge": { return [member.raids[type]] }
      case type === "sorrows": { return [member.raids[type]] }
      case type === "garden": { return [member.raids[type]] }
      case type === "dsc": { return [member.raids[type]] }
      case type === "shatteredThrone": { return [member.dungeons[type].completions, member.dungeons[type].flawless] }
      case type === "pitOfHeresy": { return [member.dungeons[type].completions, member.dungeons[type].flawless] }
      case type === "prophecy": { return [member.dungeons[type].completions, member.dungeons[type].flawless] }
      case type === "activeScore": { return [member["triumphScore"][type]] }
      case type === "legacyScore": { return [member["triumphScore"][type]] }
      case type === "lifetimeScore": { return [member["triumphScore"][type]] }
      default: { return [member[type]] }
    }
  }

  render() {
    const { clans, users, leaderboardType, highlightedUser } = this.state;
    return(
      <div className="guildRankings transScrollbar">
        <div className="guildRankingsTitle">
          <div id="rank">#</div>
          <div id="displayName">Display Name</div>
          <div id="values">{ this.getDataSet(leaderboardType).value.map(e => <div id="amount">{ e }</div>) }</div>
        </div>
        {
          users.map((member, index) => {
            return (
              <div className={`guildMember${ highlightedUser === member.membershipID ? " hl" : "" }`} key={ member.membershipID }>
                <div>{ index+1 }</div>
                <div>{ member.displayName }</div>
                <div id="values">{ this.formatDataSet(leaderboardType, member).map(e => <div>{ Misc.AddCommas(e) }</div>) }</div>
              </div>
            )
          })
        }
      </div>
    );
  }
}

export default Guild;