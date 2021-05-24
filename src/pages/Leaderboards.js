import React, { Component, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import ClanBannerGenerator from '../modules/ClanBanner';
import * as API from '../modules/requests/API';
import * as bungieRequest from '../modules/requests/BungieReq';
import * as Manifest from '../modules/handlers/ManifestHandler';
import * as Misc from '../Misc';

export class Leaderboards extends Component {

  state = {
    status: {
      status: 'startingUp',
      statusText: `Loading leaderboards`,
      loading: true
    },
    leaderboardType: null,
    highlightedUser: null,
    guild: { },
    clans: [],
    users: [],
    servers: []
  }

  componentDidMount() {
    document.title = "Marvin - Leaderboards";
    this.GetGuild();
  }

  GetGuild() {
    const path = this.props.props.location.pathname.split("/");
    if(path[2]) {
      const guildID = path[2];
      const leaderboardType = path[3] ? path[3] : "valor";
      let highlightedUser = this.state.highlightedUser;
      if(!this.state.highlightedUser) { highlightedUser = Misc.getURLVars()["hl"]; }
      this.props.setSubPage(leaderboardType);
      API.GetGuildRankings({ guildID }, ({ isError, code, message, data }) => {
        if(!isError) {
          window.history.pushState({}, '', `${ this.props.props.location.pathname }`);
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
    else {
      if(localStorage.getItem("DiscordAuth")) { this.getServers(); }
      else { this.setState({ status: { status: 'error', statusText: "Not logged in. Please login or use links provided by Marvin.", loading: false } }); }
    }
  }

  getServers() {
    let auth = JSON.parse(localStorage.getItem("DiscordAuth"));
    if(this.state.servers.length > 0) {
      window.history.pushState({}, '', `/leaderboards${ window.location.search }`);
      this.setState({ status: { status: 'serverSelection', statusText: "Please select a server.", loading: false } });
    }
    else {
      API.GetAllGuilds({ token: auth.access_token }, ({ isError, code, message, data }) => {
        if(!isError) {
          window.history.pushState({}, '', `/leaderboards${ window.location.search }`);
          this.setState({ status: { status: 'serverSelection', statusText: "Please select a server.", loading: false }, servers: data.sort((a,b) => a.name.length - b.name.length) });
        }
        else { this.setState({ status: { status: 'error', statusText: message, loading: false } }); }
      });
    }
  }

  selectServer = (server) => {
    this.props.props.location.pathname = `/leaderboards/${ server.id }/${ this.props.currentSubPage ? this.props.currentSubPage : "valor" }/${ window.location.search }`;
    this.GetGuild();
  }
  resetServerSelection = () => {
    this.props.props.location.pathname = `/leaderboards${ window.location.search }`;
    this.GetGuild();
  }

  render() {
    const { leaderboardType, highlightedUser, guild, users, clans, servers } = this.state;
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error error={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content" id="leaderboards" style={{ overflow: "hidden" }}>
          <div className="server-selection-btn" onClick={ (() => this.resetServerSelection()) }><span className="arrow"></span><span>Server Selection</span></div>
          <div className="server-name" style={{ marginLeft: "150px", background: "rgba(0,0,0,0.2)", width: "fit-content", padding: "5px", borderRadius: "5px", marginTop: "5px", marginBottom: "1px" }}>
            { guild.guildName.length > 0 ? guild.guildName : "Server" }
          </div>
          <ServerRankings clans={clans} users={users.filter(e => !e.isPrivate)} leaderboardType={leaderboardType} highlightedUser={highlightedUser} currentSubPage={this.props.currentSubPage} />
        </div>
      );
    }
    else if(status === "serverSelection") {
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          <DiscordServerSelectionContainer servers={ servers } selectServer={ ((server) => this.selectServer(server)) } />
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
      window.history.pushState({}, '', `/${ path[1] }/${ path[2] }/${ this.props.currentSubPage }/${ window.location.search }`);
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
      case leaderboardType === "sorrows": case leaderboardType === "garden": case leaderboardType === "dsc":
      case leaderboardType === "vog": { users.sort((a, b) => b.raids[leaderboardType] - a.raids[leaderboardType]); break; }
      case leaderboardType === "pLevi": { users.sort((a, b) => b.raids["prestige_levi"] - a.raids["prestige_levi"]); break; }
      case leaderboardType === "pEoW": { users.sort((a, b) => b.raids["prestige_eow"] - a.raids["prestige_eow"]); break; }
      case leaderboardType === "pSoS": { users.sort((a, b) => b.raids["prestige_sos"] - a.raids["prestige_sos"]); break; }
      case leaderboardType === "shatteredThrone": case leaderboardType === "pitOfHeresy": case leaderboardType === "prophecy": {
        users.sort((a, b) => b["dungeons"][leaderboardType].completions - a["dungeons"][leaderboardType].completions);
        break;
      }
      case leaderboardType === "presage": {
        users.sort((a, b) => b[leaderboardType].normal - a[leaderboardType].normal);
        users.sort((a, b) => b[leaderboardType].master - a[leaderboardType].master);
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
      case type === "vog": { return { name: "Vault of Glass Clears", value: ["Clears"] }; }
      case type === "totalRaids": { return { name: "Total Raids", value: ["Clears"] }; }
      case type === "shatteredThrone": { return { name: "Shattered Throne Clears", value: ["Clears", "Flawless"] } }
      case type === "pitOfHeresy": { return { name: "Pit of Heresy Clears", value: ["Clears", "Flawless"] } }
      case type === "prophecy": { return { name: "Prophecy Clears", value: ["Clears", "Flawless"] } }
      case type === "presage": { return { name: "Presage Clears", value: ["Normal", "Master"] } }
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
      case type === "gos": { return [member.raids[type]] }
      case type === "vog": { return [member.raids[type]] }
      case type === "shatteredThrone": { return [member.dungeons[type].completions, member.dungeons[type].flawless] }
      case type === "pitOfHeresy": { return [member.dungeons[type].completions, member.dungeons[type].flawless] }
      case type === "prophecy": { return [member.dungeons[type].completions, member.dungeons[type].flawless] }
      case type === "presage": { return [member[type].normal, member[type].master] }
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

class DiscordServerSelectionContainer extends Component {
  render() {
    return(
      <React.Fragment>
        <div className="server-selections-title">Server Selection</div>
        <div className="server-selections-desc">Below are a list of servers that Marvin and you have in common (max: 20), please select a server which you would like to see leaderboards for.</div>
        <div className="server-selections">
          { this.props.servers.map((server) => <DiscordServerContainer key={ server.id } server={server} selectServer={ ((server) => this.props.selectServer(server)) }/>) }
        </div>
      </React.Fragment>
    );
  }
}

class DiscordServerContainer extends Component {
  render() {
    let smallName = this.props.server.name.match(/\b(\w)/g).join('').slice(0, 2);
    return(
      <div key={ this.props.server.id } className="server-info-container" onClick={ (() => this.props.selectServer(this.props.server)) }>
        { this.props.server.icon ? 
          <div className="server-icon" style={{ backgroundImage: `url("https://cdn.discordapp.com/icons/${ this.props.server.id }/${ this.props.server.icon }.png")` }}></div> :
          <div className="server-icon" style={{ backgroundColor: '#151921', lineHeight: '50px', textAlign: 'center' }}>{ smallName }</div>
        }
        <div className="server-name" >{ this.props.server.name }</div>
      </div>
    );
  }
}

export default Leaderboards;