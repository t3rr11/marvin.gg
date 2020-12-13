import React, { Component, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import Search from '../modules/Search';
import ClanBannerGenerator from '../modules/ClanBanner';
import { formatSmallTime } from '../modules/Misc';
import * as apiRequest from '../modules/requests/API';

export class Clans extends Component {

  state = {
    status: {
      status: 'startingUp',
      statusText: `Collecting clan data...`,
      loading: true
    },
    pageNumber: 0
  }

  componentDidMount() {
    document.title = "Marvin - Clans";
    this.GetClans();
  }

  async GetClans() {
    apiRequest.GetAllClans().then((data) => {
      if(!data?.isError) {
        this.setState({
          status: { status: 'ready', statusText: `Finished grabbing clan data.`, loading: false },
          clans: data.data.sort((a,b) => new Date(a.joinedOn).getTime() - new Date(b.joinedOn).getTime())
        });
      }
    });
  }

  htmlDecode(input){
    var e = document.createElement('textarea');
    e.innerHTML = input;
    // handle case of empty input
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
  }

  render() {
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error statusText={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          <Search />
          <div className="clans-container transScrollbar">
            {
              this.state.clans.slice(0, 45).map(clan => {
                return (
                  <div className={`clan-container ${ clan.isTracking ? "tracking" : "not-tracking" }`}>
                    <div className="clan-banner-icon-container"><ClanBannerGenerator clanID={ clan.clanID } clanBanner={ clan.clanBanner } /></div>
                    <div className="clan-details">
                      <div className="clan-name">{ this.htmlDecode(clan.clanName) } ({ this.htmlDecode(clan.clanCallsign) })</div>
                      <div className="clan-members">{ clan.memberCount } / 100</div>
                    </div>
                  </div>
                );
              })
            }
            <div className="clans-footer">
              <div>{`<`} Page: { this.state.pageNumber } {`>`}</div>
            </div>
          </div>
        </div>
      );
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

export default Clans;