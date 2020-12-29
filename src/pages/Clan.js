import React, { Component, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import ClanBannerGenerator from '../modules/ClanBanner';
import * as apiRequest from '../modules/requests/API';
import * as bungieRequest from '../modules/requests/BungieReq';
import * as Manifest from '../modules/handlers/ManifestHandler';
import * as Misc from '../Misc';

export class Clan extends Component {

  state = {
    status: {
      status: 'startingUp',
      statusText: `Loading Clan Details`,
      loading: true
    },
    clan: { }
  }

  componentDidMount() {
    document.title = "Marvin - Clan";
    this.GetClan();
  }

  GetClan() {
    const clanID = this.props.props.location.pathname.substr("/clan/".length);
    Promise.all([ bungieRequest.GetClanById(clanID).then((data) => data), apiRequest.GetClan({ clanID }).then((data) => data) ]).then((data) => {
      let bungieData = data[0];
      let marvinData = data[1];
      //Check for errors
      if(!bungieData?.isError && !marvinData?.isError) {
        if(bungieData.Data.ErrorCode === 1) {
          //Set the state as ready to make the page visible whilst loading other components.
          this.setState({ status: { status: 'ready', statusText: `Finished grabbing clan data.`, loading: false }, bungie: { clanData: bungieData.Data.Response } });
          //Get clan members data from bungie.net
          bungieRequest.GetClanMembersById(clanID).then((data) => {
            let bungie = this.state.bungie;
            bungie.memberData = data.Data.Response.results.map(e => {
              return {
                "displayName": e.destinyUserInfo.LastSeenDisplayName,
                "membershipID": e.destinyUserInfo.membershipId,
                "membershipType": e.destinyUserInfo.membershipType,
                "isOnline": e.isOnline,
                "joinDate": e.joinDate,
                "lastPlayed": new Date(e.lastOnlineStatusChange * 1000).toISOString()
              }
            });
            this.setState({ bungie: bungie });
          });
          //If there was data from Marvin then get that data as well
          if(marvinData.code !== 404) {
            this.setState({ marvin: { clanData: marvinData.data[0] } });
            apiRequest.GetClanMembers({ clanID }).then((data) => { let marvin = this.state.marvin; marvin.memberData = data.data; this.setState({ marvin: marvin }); });
            apiRequest.GetClanBroadcasts({ clanID }).then((data) => { let marvin = this.state.marvin; marvin.broadcasts = data.data.filter((object, index) => index === data.data.findIndex(obj => (object.membershipID === obj.membershipID && object.broadcast === obj.broadcast && object.season === obj.season))); this.setState({ marvin: marvin }); });
          }
        }
        else { this.setState({ status: { status: 'error', statusText: bungieData.Data.Message, loading: false } }); }
      }
      else {
        if(bungieData.isError) { this.setState({ status: { status: 'error', statusText: bungieData.Data.Message, loading: false } }); }
        else if(marvinData.isError) { this.setState({ status: { status: 'error', statusText: marvinData.message, loading: false } }); }
      }
    });
  }

  render() {
    const { status, statusText } = this.state.status;
    const marvinData = this.state.marvin;
    const bungieData = this.state.bungie;
    if(status === "error") { return (<Error error={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          <div className="clan-content">
            <div className="clan-info-container transScrollbar">
              <div className="clan-banner-container">
                <ClanBannerGenerator clanID={ bungieData.clanData.detail.groupID } clanBanner={ bungieData.clanData.detail.clanInfo.clanBannerData } width="180px" height="240px" />
                <div className="creation-date">Since: { new Date(bungieData.clanData.detail.creationDate).toDateString().split(' ').slice(1).join(' ') }</div>
                <div className={`join-btn ${ bungieData.clanData.detail.defaultPublicity === 0 ? "inviteOnly" : bungieData.clanData.detail.defaultPublicity === 1 ? "join" : "request" }`}>
                  { bungieData.clanData.detail.defaultPublicity === 0 ? "Invite Only" : bungieData.clanData.detail.defaultPublicity === 1 ? "Join Clan" : "Request to Join" }
                </div>
              </div>
              <div className="clan-details transScrollbar">
                <div className="clan-name">{ bungieData.clanData.detail.name } [{ bungieData.clanData.detail.clanInfo.clanCallsign }] <span className="clan-members">{ bungieData.clanData.detail.memberCount } / { bungieData.clanData.detail.features.maximumMembers }</span></div>
                <div className="clan-motto">"{ bungieData.clanData.detail.motto }"</div>
                <div className="clan-about">{ bungieData.clanData.detail.about }</div>
              </div>
              {
                marvinData ? (
                  <div className="clan-statistics">
                    <ClanBroadcasts marvinData={ marvinData } />
                  </div>
                ) : ""
              }
            </div>
            <ClanMembers bungieData={ bungieData } marvinData={ marvinData } />
          </div>
        </div>
      );
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

class ClanBroadcasts extends Component {
  //TODO Check for Manifest Mounted!!
  render() {
    const marvinData = this.props.marvinData;
    if(marvinData.broadcasts?.length > 0) {
      const broadcasts = marvinData.broadcasts.slice(0, 30);
      return (
        <div className="clan-broadcasts-container">
          { broadcasts.map(broadcast => { return <Broadcast broadcast={ broadcast } marvinData={ marvinData } /> }) }
        </div>
      )
    }
    else { return <Loader statusText="Loading Clan Broadcasts" /> }
  }
}

class Broadcast extends Component {
  render() {
    const broadcast = this.props.broadcast;
    switch(broadcast.type) {
      case "clan": {
        return (
          <div className="broadcast-container">
            <div className="broadcast-details">
              <ClanBannerGenerator type="small" clanID={ broadcast.clanID } clanBanner={ this.props.marvinData.clanData.clanBanner } width="35px" height="50px" />
              <div className="broadcast-username">{ broadcast.displayName }</div>
              <div className="broadcast-name">Clan Level Up</div>
              <div className="broadcast-date">{ new Date(broadcast.date).toDateString().split(' ').slice(1).join(' ') }</div>
            </div>
          </div>
        )
      }
      case "item": {
        let item = broadcast.hash ? Manifest.MANIFEST.DestinyCollectibleDefinition[broadcast.hash] : null;
        return (
          <div className="broadcast-container">
            <div className="broadcast-details">
              { item ? ( <img className="broadcast-image item" src={`https://bungie.net${ item.displayProperties.icon }`} /> ) : "" }
              <div className="broadcast-username">{ broadcast.displayName }</div>
              <div className="broadcast-name">{ broadcast.broadcast }</div>
              <div className="broadcast-date">{ new Date(broadcast.date).toDateString().split(' ').slice(1).join(' ') }</div>
            </div>
          </div>
        )
      }
      case "title": {
        let title = broadcast.hash ? Manifest.MANIFEST.DestinyRecordDefinition[broadcast.hash] : null;
        return (
          <div className="broadcast-container">
            <div className="broadcast-details">
              { title ? ( <img className="broadcast-image title" src={`https://bungie.net${ title.displayProperties.icon }`} /> ) : "" }
              <div className="broadcast-username">{ broadcast.displayName }</div>
              <div className="broadcast-name">{ broadcast.broadcast }</div>
              <div className="broadcast-date">{ new Date(broadcast.date).toDateString().split(' ').slice(1).join(' ') }</div>
            </div>
          </div>
        )
      }
      default: {
        return (
          <div className="broadcast-container">
            <div className="broadcast-details">
              <div className="broadcast-username">{ broadcast.displayName }</div>
              <div className="broadcast-name">{ broadcast.broadcast }</div>
              <div className="broadcast-date">{ new Date(broadcast.date).toDateString().split(' ').slice(1).join(' ') }</div>
            </div>
          </div>
        )
      }
    }
  }
}

class ClanMembers extends Component {
  render() {
    const bungieData = this.props.bungieData;
    const marvinData = this.props.marvinData;
    if(bungieData.memberData?.length > 0) {
      const founder = bungieData.memberData.find(e => e.membershipID === bungieData.clanData.founder.destinyUserInfo.membershipId);
      const onlineMembers = bungieData.memberData.filter(e => { return (new Date().getTime() - new Date(e.lastPlayed).getTime()) > 0 && (new Date().getTime() - new Date(e.lastPlayed).getTime()) <= 600000 && e.membershipID !== bungieData.clanData.founder.destinyUserInfo.membershipId }); // 10 Minutes
      const dailyMembers = bungieData.memberData.filter(e => { return (new Date().getTime() - new Date(e.lastPlayed).getTime()) > 600000 && (new Date().getTime() - new Date(e.lastPlayed).getTime()) <= 86400000 && e.membershipID !== bungieData.clanData.founder.destinyUserInfo.membershipId }); // 24 Hours
      const weeklyMembers = bungieData.memberData.filter(e => { return (new Date().getTime() - new Date(e.lastPlayed).getTime()) > 86400000 && (new Date().getTime() - new Date(e.lastPlayed).getTime()) <= 604800000 && e.membershipID !== bungieData.clanData.founder.destinyUserInfo.membershipId }); // 7 Days
      const inactiveMembers = bungieData.memberData.filter(e => { return (new Date().getTime() - new Date(e.lastPlayed).getTime()) > 604800000 && e.membershipID !== bungieData.clanData.founder.destinyUserInfo.membershipId }); // 7 Days+
      return (
        <div className="clan-members-container transScrollbar">
          <Member member={founder} tag="founder" />
          { onlineMembers.sort((a,b) => new Date(b.lastPlayed) - new Date(a.lastPlayed)).map(member => { return <Member member={member} tag="online" /> }) }
          { dailyMembers.sort((a,b) => new Date(b.lastPlayed) - new Date(a.lastPlayed)).map(member => { return <Member member={member} tag="daily" /> }) }
          { weeklyMembers.sort((a,b) => new Date(b.lastPlayed) - new Date(a.lastPlayed)).map(member => { return <Member member={member} tag="weekly" /> }) }
          { inactiveMembers.sort((a,b) => new Date(b.lastPlayed) - new Date(a.lastPlayed)).map(member => { return <Member member={member} tag="inactive" /> }) }
        </div>
      )
    }
    else { return <Loader statusText="Loading Clan Members" /> }
  }
}

class Member extends Component {
  render() {
    const member = this.props.member;
    const lastOnline = new Date().getTime() - new Date(member.lastPlayed).getTime();
    return (
      <div className={`clan-member-container ${ this.props.tag === "founder" ? "founder" : lastOnline < 600000 ? "online" : lastOnline < 86400000 ? "daily" : lastOnline < 604800000 ? "weekly" : "" }` }>
        <div className="clan-member-details">
          <div className="clan-member-name">{ member.displayName } <Tag tag={ this.props.tag } /></div>
          <div className="clan-member-last-seen">{ member.lastPlayed ? `Last seen: ${ Misc.formatTime((new Date().getTime() - new Date(member.lastPlayed).getTime()) / 1000) } ago` : "Private Account" }</div>
        </div>
      </div>
    )
  }
}

class Tag extends Component {
  render() {
    switch(this.props.tag) {
      case "founder" : { return <div className="tag founder">Founder</div>; }
      case "online" : { return <div className="tag online">Online</div>; }
      case "daily" : { return <div className="tag daily">Daily</div>; }
      case "weekly" : { return <div className="tag weekly">Weekly</div>; }
      case "inactive" : { return <div className="tag inactive">Inactive</div>; }
    }
  }
}

export default Clan;