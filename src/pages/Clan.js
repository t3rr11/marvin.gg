import React, { Component, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import ClanBannerGenerator from '../modules/ClanBanner';
import * as apiRequest from '../modules/requests/API';
import * as bungieRequest from '../modules/requests/BungieReq';
import * as Misc from '../Misc';

export class Clan extends Component {

  state = {
    status: {
      status: 'startingUp',
      statusText: `Loading Clan Details`,
      loading: true
    },
    clan: { },
    marvin: { },
    clanMembers: []
  }

  componentDidMount() {
    document.title = "Marvin - Clan";
    this.GetClan();
  }

  GetClan() {
    const clanID = this.props.props.location.pathname.substr("/clan/".length);
    Promise.all([ bungieRequest.GetClanById(clanID).then((data) => data), apiRequest.GetClan({ clanID }).then((data) => data) ]).then((data) => {
      let clanData = data[0];
      let marvinData = data[1];
      //Check for errors
      if(!clanData?.isError && !marvinData?.isError) {
        if(clanData.Data.ErrorCode === 1) {
          this.setState({
            status: { status: 'ready', statusText: `Finished grabbing clan data.`, loading: false },
            clan: clanData.Data.Response,
            marvin: marvinData.data[0]
          });
          if(marvinData.code !== 404) {
            apiRequest.GetClanMembers({ clanID }).then((data) => {
              this.setState({ clanMembers: data.data });
            });
          }
          else {
            bungieRequest.GetClanMembersById(clanID).then((data) => {
              this.setState({
                clanMembers: data.Data.Response.results.map(e => {
                  return {
                    "displayName": e.destinyUserInfo.LastSeenDisplayName,
                    "membershipID": e.destinyUserInfo.membershipId,
                    "membershipType": e.destinyUserInfo.membershipType,
                    "isOnline": e.isOnline,
                    "joinDate": e.joinDate,
                    "lastPlayed": new Date(e.lastOnlineStatusChange * 1000).toISOString()
                  }
                })
              });
            });
          }
        }
        else { this.setState({ status: { status: 'error', statusText: clanData.Data.Message, loading: false } }); }
      }
      else {
        if(clanData.isError) { this.setState({ status: { status: 'error', statusText: clanData.Data.Message, loading: false } }); }
        else if(marvinData.isError) { this.setState({ status: { status: 'error', statusText: marvinData.message, loading: false } }); }
      }
    });
  }

  render() {
    const { status, statusText } = this.state.status;
    const marvinData = this.state.marvin;
    const clanData = this.state.clan;
    if(status === "error") { return (<Error error={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          <div className="clan-content">
            <div className="clan-banner-container">
              <ClanBannerGenerator clanID={ clanData.detail.groupID } clanBanner={ clanData.detail.clanInfo.clanBannerData } width="180px" height="240px" />
              <div className="creation-date">Since: { new Date(clanData.detail.creationDate).toDateString().split(' ').slice(1).join(' ') }</div>
              <div className={`join-btn ${ clanData.detail.defaultPublicity === 0 ? "inviteOnly" : clanData.detail.defaultPublicity === 1 ? "join" : "request" }`}>
                { clanData.detail.defaultPublicity === 0 ? "Invite Only" : clanData.detail.defaultPublicity === 1 ? "Join Clan" : "Request to Join" }
              </div>
            </div>
            <div className="clan-details">
              <div className="clan-name">{ clanData.detail.name } [{ clanData.detail.clanInfo.clanCallsign }] <span className="clan-members">{ clanData.detail.memberCount } / { clanData.detail.features.maximumMembers }</span></div>
              <div className="clan-motto">"{ clanData.detail.motto }"</div>
              <div className="clan-about">{ clanData.detail.about }</div>
            </div>
            <ClanMembers clanDetails={ clanData } clanMembers={ this.state.clanMembers } isTracking={ marvinData ? true : false } />
          </div>
        </div>
      );
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

class ClanMembers extends Component {
  render() {
    if(this.props.clanMembers?.length > 0) {
      let clanDetails = this.props.clanDetails;
      let clanMembers = this.props.clanMembers;
      return (
        <div className="clan-members-container transScrollbar">
          { 
            clanMembers
              .filter(e => e.membershipID === clanDetails.founder.destinyUserInfo.membershipId)
              .map(member => {
              return <Member member={member} founder={true} />
            })
          }
          {
            clanMembers
              .filter(e => e.membershipID !== clanDetails.founder.destinyUserInfo.membershipId)
              .sort((a,b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
              .map(member => {
              return <Member member={member} founder={false} /> 
            })
          }
        </div>
      )
    }
    else { return <Loader statusText="Loading Clan Members" /> }
  }
}

class Member extends Component {
  render() {
    let member = this.props.member;
    return (
      <div className={`clan-member-container ${ this.props.founder ? "founder" : "" }`}>
        <div className="clan-member-details">
          <div className="clan-member-name">{ member.displayName } { this.props.founder ? (<div className="founder-tag">Founder</div>) : "" }</div>
          <div className="clan-member-last-seen">{ member.lastPlayed ? `Last seen: ${ Misc.formatTime((new Date().getTime() - new Date(member.lastPlayed).getTime()) / 1000) } ago` : "Private Account" }</div>
        </div>
      </div>
    )
  }
}

export default Clan;