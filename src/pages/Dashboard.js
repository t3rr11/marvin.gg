import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import Loader from '../modules/Loader';
import Error from '../modules/Error';
import ClanBannerGenerator from '../modules/ClanBanner';
import * as API from '../modules/requests/API';
import * as Misc from '../Misc';
import { MANIFEST } from '../modules/handlers/ManifestHandler';

export class Dashboard extends Component {

  state = {
    status: {
      status: 'startingUp',
      statusText: `Gathering servers...`,
      loading: true
    },
    servers: [],
    selectedServer: null
  }

  componentDidMount() {
    document.title = "Marvin - Dashboard";
    if(localStorage.getItem("DiscordAuth")) { this.getServers(); }
    else { this.setState({ status: { status: 'error', statusText: "Please login first.", loading: false } }); }
  }
  componentWillUnmount() {  }

  getServers() {
    let auth = JSON.parse(localStorage.getItem("DiscordAuth"));
    API.GetGuilds({ token: auth.access_token }, ({ isError, code, message, data }) => {
      if(!isError) {
        this.setState({ status: { status: 'ready', statusText: `Finished loading`, loading: false }, servers: data.sort((a,b) => a.name.length - b.name.length) });
        //Temp
        //this.selectServer(data[2]);
      }
      else { this.setState({ status: { status: 'error', statusText: message, loading: false } }); }
    });
  }

  selectServer = (server) => {
    this.setState({ status: { status: 'loadingServer', statusText: "Gathering server deets and clan info.", loading: true } });
    let auth = JSON.parse(localStorage.getItem("DiscordAuth"));
    API.GetGlobals((globals) => {
      if(!globals.isError) {
        API.GetGuildDashboard({ token: auth.access_token, guildID: server.guildID }, ({ isError, code, message, data }) => {
          if(!isError) {
            this.setState({ 
              status: { status: 'ready', statusText: `Finished loading`, loading: false },
              selectedServer: server,
              clans: data.clans,
              users: data.users,
              globals: globals.data
            });
          }
          else { this.setState({ status: { status: 'error', statusText: message, loading: false } }); }
        });
      }
      else { this.setState({ status: { status: 'error', statusText: globals.message, loading: false } }); }
    });
  }

  resetServerSelection = () => { this.setState({ selectedServer: null }); }

  render() {
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error error={ statusText } />) }
    else if(status === "ready") {
      if(this.state.selectedServer) {
        switch(true) {
          case this.props.currentSubPage === "serverRankings": {
            return (
              <div className="page-content" style={{ overflow: "hidden" }}>
                <div className="server-selection-btn" onClick={ (() => this.resetServerSelection()) }><span className="arrow"></span><span>Server Selection</span></div>
                <div className="server-name" style={{ marginLeft: "150px", background: "rgba(0,0,0,0.2)", width: "fit-content", padding: "5px", borderRadius: "5px", marginTop: "5px" }}>
                  { this.state.selectedServer.name }
                </div>
                <DiscordServerRankings server={ this.state.selectedServer } clans={ this.state.clans } users={ this.state.users } globals={ this.state.globals } />
              </div>
            )
          }
          case this.props.currentSubPage === "manageMarvin": {
            return (
              <div className="page-content" style={{ overflow: "hidden" }}>
                <div className="server-selection-btn" onClick={ (() => this.resetServerSelection()) }><span className="arrow"></span><span>Server Selection</span></div>
                <div className="server-name" style={{ marginLeft: "150px", background: "rgba(0,0,0,0.2)", width: "fit-content", padding: "5px", borderRadius: "5px", marginTop: "5px" }}>
                  { this.state.selectedServer.name }
                </div>
                <DiscordServerManage server={ this.state.selectedServer } clans={ this.state.clans } users={ this.state.users } globals={ this.state.globals } />
              </div>
            )
          }
          default: {
            return (
              <div className="page-content" style={{ overflow: "hidden" }}>
                <div className="server-selection-btn" onClick={ (() => this.resetServerSelection()) }><span className="arrow"></span><span>Server Selection</span></div>
                <DiscordServerDetails server={ this.state.selectedServer } clans={ this.state.clans } users={ this.state.users } globals={ this.state.globals } />
              </div>
            )
          }
        }
      }
      else {
        return (
          <div className="page-content" style={{ overflow: "hidden" }}>
            <DiscordServerSelectionContainer servers={ this.state.servers } selectServer={ ((server) => this.selectServer(server)) } />
          </div>
        );
      }
      
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

export class DiscordServerSelectionContainer extends Component {
  render() {
    return(
      <React.Fragment>
        <div className="server-selections-title">Server Selection</div>
        <div className="server-selections-desc">Below are a list of servers you are administrator in, please select a Marvin to manage.</div>
        <div className="server-selections">
          { this.props.servers.map((server) => <DiscordServerContainer server={server} selectServer={ ((server) => this.props.selectServer(server)) }/>) }
        </div>
      </React.Fragment>
    );
  }
}

export class DiscordServerContainer extends Component {
  render() {
    let smallName = this.props.server.name.match(/\b(\w)/g).join('').slice(0, 2);
    return(
      <div className="server-info-container" onClick={ (() => this.props.selectServer(this.props.server)) }>
        { this.props.server.icon ? 
          <div className="server-icon" style={{ backgroundImage: `url("https://cdn.discordapp.com/icons/${ this.props.server.id }/${ this.props.server.icon }.png")` }}></div> :
          <div className="server-icon" style={{ backgroundColor: '#151921', lineHeight: '50px', textAlign: 'center' }}>{ smallName }</div>
        }
        <div className="server-name" >{ this.props.server.name }</div>
      </div>
    );
  }
}

export class DiscordServerDetails extends Component {
  render() {
    let server = this.props.server;
    console.log(server);
    let smallName = server.name.match(/\b(\w)/g).join('').slice(0, 2);
    return(
      <div className="server-details-container">
        <div className="server-name" style={{ marginLeft: "150px", background: "rgba(0,0,0,0.2)", width: "fit-content", padding: "5px", borderRadius: "5px", marginTop: "5px" }}>
          { server.name }
        </div>
        <div className="server-clan-banners">
          {
            this.props.clans.map(clan => {
              return (
                <div className="server-clan-banner" data-tip data-for={ `${ clan.clanID }-tooltip` }>
                  <ClanBannerGenerator type="small" clanID={ clan.clanID } clanBanner={ clan.clanBanner } width="45px" height="60px" />
                  <ReactTooltip id={ `${ clan.clanID }-tooltip` } place="bottom" effect="solid" backgroundColor="#1a1d2d">
                    <div>{ clan.clanName }</div>
                  </ReactTooltip>
                </div>
              )
            })
          }
        </div>
        <div>Guild ID: { server.guildID }</div>
        <div>Guild Name: { server.guildName }</div>
        <div>Started Tracking On: { server.joinedOn }</div>
        <div>Name: { server.name }</div>
        <div>Prefix: { server.prefix }</div>
        <div>Clans: { JSON.stringify(server.clans) }</div>
        <div>Announcements: { JSON.stringify(server.announcements) }</div>
        <div>Broadcasts: { JSON.stringify(server.broadcasts) }</div>
        <TrackedItemsContainer server={ server } globals={ this.props.globals } />
        <div className="info">This page is still way in beta.</div>
      </div>
    );
  }
}

export class DiscordServerManage extends Component {
  render() {
    return(
      <div className="server-manage-container">
        Yeah still working on this one. It's a long project.
      </div>
    );
  }
}

export class DiscordServerRankings extends Component {

  state = {
    sortBy: "least",
    type: "lastPlayed",
    users: []
  }

  componentDidMount() {
    const users = this.props.users;
    this.setState({ users }, (() => { this.sortRankings(this.state.type); }));
  }

  sortRankings(type) {
    let users = this.state.users;
    let sortBy = this.state.sortBy;
    if(type === this.state.type) { if(sortBy === "most") { sortBy = "least" } else { sortBy = "most" } }
    switch(true) {
      case type === "valor": { users.sort((a, b) => { return sortBy === "most" ? b[type].current - a[type].current : a[type].current - b[type].current }); break; }
      case type === "infamy": { users.sort((a, b) => { return sortBy === "most" ? b[type].current - a[type].current : a[type].current - b[type].current }); break; }
      case type === "triumphScore": { users.sort((a, b) => { return sortBy === "most" ? b[type].score - a[type].score : a[type].score - b[type].score }); break; }
      case type === "joinDate": { users.sort((a, b) => { return sortBy === "most" ? new Date(b[type]).getTime() - new Date(a[type]).getTime() : new Date(a[type]).getTime() - new Date(b[type]).getTime() }); break; }
      case type === "lastPlayed": { users.sort((a, b) => { return sortBy === "most" ? new Date(b[type]).getTime() - new Date(a[type]).getTime() : new Date(a[type]).getTime() - new Date(b[type]).getTime() }); break; }
      default: { users.sort((a, b) => { return sortBy === "most" ? b[type] - a[type] : a[type] - b[type] }); break; }
    }
    this.setState({ sortBy, type, users });
  }

  render() {
    const users = this.state.users;
    return(
      <div className="server_rankings transScrollbar">
        <div className="rankings_title">
          <div id="displayName"><div>Display Name</div></div>
          <div id="seasonRank" onClick={ ((e) => this.sortRankings("seasonRank")) }><div>SR</div><div className={ this.state.type === "seasonRank" ? "caret_down" : "caret_up" }> </div></div>
          <div id="timePlayed" onClick={ ((e) => this.sortRankings("timePlayed")) }><div>Time Played</div><div className={ this.state.type === "timePlayed" ? "caret_down" : "caret_up" }> </div></div>
          <div id="valor" onClick={ ((e) => this.sortRankings("valor")) }><div>Valor</div><div className={ this.state.type === "valor" ? "caret_down" : "caret_up" }> </div></div>
          <div id="infamy" onClick={ ((e) => this.sortRankings("infamy")) }><div>Infamy</div><div className={ this.state.type === "infamy" ? "caret_down" : "caret_up" }> </div></div>
          <div id="glory" onClick={ ((e) => this.sortRankings("glory")) }><div>Glory</div><div className={ this.state.type === "glory" ? "caret_down" : "caret_up" }> </div></div>
          <div id="triumphScore" onClick={ ((e) => this.sortRankings("triumphScore")) }><div>Score</div><div className={ this.state.type === "triumphScore" ? "caret_down" : "caret_up" }> </div></div>
          <div id="joinDate" onClick={ ((e) => this.sortRankings("joinDate")) }><div>Join Date</div><div className={ this.state.type === "joinDate" ? "caret_down" : "caret_up" }> </div></div>
          <div id="lastPlayed" onClick={ ((e) => this.sortRankings("lastPlayed")) }><div>Last Played</div><div className={ this.state.type === "lastPlayed" ? "caret_down" : "caret_up" }> </div></div>
        </div>
        {
          users.map((member) => {
            let lastPlayed = (new Date().getTime() - new Date(member.lastPlayed).getTime()) / 1000;
            return (
              <div className="clan_member" key={ member.membershipId }>
                <div>{ member.displayName }</div>
                <div>{ Misc.AddCommas(member.seasonRank) }</div>
                <div>{ Misc.AddCommas(Math.round(member.timePlayed / 60)) } Hrs</div>
                <div>{ Misc.AddCommas(member.valor.current) } ({ member.valor.resets })</div>
                <div>{ Misc.AddCommas(member.infamy.current) } ({ member.infamy.resets })</div>
                <div>{ Misc.AddCommas(member.glory) }</div>
                <div>{ Misc.AddCommas(member.triumphScore.score) }</div>
                <div>{ new Date(member.joinDate).toDateString().slice(4,new Date(member.joinDate).toDateString().length) }</div>
                <div>{ lastPlayed > 300 ? (`${ Misc.formatTime(lastPlayed) } ago`) : ( "Online" ) }</div>
              </div>
            )
          })
        }
      </div>
    );
  }
}

export class TrackedItemsContainer extends Component {
  render() {
    let server = this.props.server;
    let globalItems = this.props.globals.map(e => { return e.hash });
    let extraItems = server.broadcasts.extraItems.map(e => { if(e.enabled) return e.hash });
    let ignoredItems = server.broadcasts.extraItems.map(e => { if(!e.enabled) return e.hash });
    let trackedItems = [];
    if(server.broadcasts.mode === "Auto") { trackedItems = [...globalItems.filter(e => !ignoredItems.includes(e)), ...extraItems.filter(e => !globalItems.includes(e))]; }
    else { trackedItems = extraItems; }
    return(
      <React.Fragment>
        <div className="server-tracked-items-title">Tracked Items</div>
        <div className="server-tracked-items transScrollbar">
          {
            trackedItems.map((collectibleHash) => {
              let itemData = MANIFEST?.DestinyCollectibleDefinition[collectibleHash];
              if(itemData) {
                return (
                  <div className="item-container" data-tip data-for={ `${ collectibleHash }-tooltip` }>
                    <img className="item-image" src={ `https://bungie.net${ itemData?.displayProperties?.icon }` } />
                    <div>{ itemData?.displayProperties?.name }</div>
                    <ReactTooltip id={ `${ collectibleHash }-tooltip` } place="bottom" effect="solid" backgroundColor="#1a1d2d">
                      <div>{ itemData?.displayProperties?.name }</div>
                    </ReactTooltip>
                  </div>
                )
              }
            })
          }
        </div>
      </React.Fragment>
    )
  }
}

export default Dashboard;