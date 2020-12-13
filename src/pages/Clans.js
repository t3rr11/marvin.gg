import React, { Component, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import { findBestMatch } from 'string-similarity';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
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
    pageNumber: 0,
    input: "",
    results: []
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

  searchForClans = (input) => {
    if(input === "") { this.setState({ input: input, results: [] }); }
    else { this.setState({ input: input, results: findBestMatch(input, this.state.clans.map(e => e.clanName)).ratings.filter(e => e.rating > 0.2).sort((a,b) => b.rating - a.rating) }); }
  }

  render() {
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error statusText={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          <div className="clans-search-container">
            <input className="clans-searchbar" type="text" placeholder="Search..." aria-label="Search..." data-lpignore="true" onKeyUp={ event => { this.searchForClans(event.target.value) } } />
          </div>
          <div className="clans-content">
            <div className="clans-container transScrollbar">
              {
                this.state.input.length > 0 ? this.state.results.map(clanTarget => {
                  let clan = this.state.clans.find(e => clanTarget.target === e.clanName);
                  return (
                    <div className={`clan-container ${ clan.isTracking ? "tracking" : "not-tracking" }`}>
                      <div className="clan-banner-icon-container"><ClanBannerGenerator clanID={ clan.clanID } clanBanner={ clan.clanBanner } /></div>
                      <div className="clan-details">
                        <div className="clan-name">{ this.htmlDecode(clan.clanName) } ({ this.htmlDecode(clan.clanCallsign) })</div>
                        <div className="clan-members">{ clan.memberCount } / 100</div>
                      </div>
                    </div>
                  )
                }) : (
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
                }))
              }
            </div>
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