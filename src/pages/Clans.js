import React, { Component, useRef, useEffect } from 'react';
import { FiArrowLeftCircle, FiArrowRightCircle } from 'react-icons/fi';
import ReactTooltip from 'react-tooltip';
import { findBestMatch } from 'string-similarity';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import ClanBannerGenerator from '../modules/ClanBanner';
import * as apiRequest from '../modules/requests/API';
import * as Misc from '../Misc';

export class Clans extends Component {

  state = {
    status: {
      status: 'startingUp',
      statusText: `Collecting clan data...`,
      loading: true
    },
    page: {
      pageStart: 0,
      pageEnd: 45,
      pageNumber: 1,
      maxPages: 1
    },
    input: "",
    results: []
  }

  componentDidMount() {
    document.title = "Marvin - Clans";
    this.GetClans();
  }

  GetClans() {
    apiRequest.GetAllClans().then((data) => {
      if(!data?.isError) {
        this.setState({
          status: { status: 'ready', statusText: `Finished grabbing clan data.`, loading: false },
          clans: data.data.sort((a,b) => new Date(a.lastScan).getTime() - new Date(b.lastScan).getTime()),
          page: { pageStart: 0, pageEnd: 45, pageNumber: 1, maxPages: Math.round(data.data.filter(e => e.isTracking).length / 45) }
        });
      }
    });
  }

  searchForClans = (input) => {
    if(input === "") { this.setState({ input: input, results: [] }); }
    else { this.setState({ input: input, results: findBestMatch(input, this.state.clans.map(e => e.clanName)).ratings.filter(e => e.rating > 0.5) }); }
  }

  setNextPage = () => {
    let { pageStart, pageEnd, pageNumber, maxPages } = this.state.page;
    if(pageNumber < maxPages) {
      pageStart = pageEnd;
      pageEnd = pageEnd + 45;
      pageNumber++;
    }
    this.setState({ page: { pageStart, pageEnd, pageNumber, maxPages } });
  }

  setPrevPage = () => {
    let { pageStart, pageEnd, pageNumber, maxPages } = this.state.page;
    if(pageNumber > 1) {
      pageEnd = pageStart;
      pageStart = pageStart - 45;
      pageNumber--;
    }
    this.setState({ page: { pageStart, pageEnd, pageNumber, maxPages } });
  }

  ClanComponent = (clan) => {
    return (
      <div className={`clan-container ${ clan.isTracking ? "tracking" : "not-tracking" }`} onClick={ (() => this.props.selectedClan(clan.clanID)) }>
        <div className="clan-banner-icon-container"><ClanBannerGenerator type="small" clanID={ clan.clanID } clanBanner={ clan.clanBanner } width="45px" height="60px" /></div>
        <div className="clan-details">
          <div className="clan-name">{ Misc.htmlDecode(clan.clanName) } ({ Misc.htmlDecode(clan.clanCallsign) })</div>
          <div className="clan-members">{ clan.memberCount } / 100</div>
          <div className="clan-tracking">{ clan.isTracking ? "Tracking" : "No longer tracking" }</div>
        </div>
      </div>
    )
  }

  render() {
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error error={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          <div className="clans-search-container">
            <input className="clans-searchbar" type="text" placeholder="Search..." aria-label="Search..." data-lpignore="true" onKeyUp={ event => { this.searchForClans(event.target.value) } } />
          </div>
          <div className="clans-content">
            <div className="clans-container transScrollbar">
              {
                this.state.input.length > 0 ? this.state.results.map(clanTarget => { return this.ClanComponent(this.state.clans.find(e => clanTarget.target === e.clanName)); }) : (
                this.state.clans.filter(e => e.isTracking).slice(this.state.page.pageStart, this.state.page.pageEnd).map(clan => { return this.ClanComponent(clan); }))
              }
            </div>
            <div className="clans-footer">
              <div className="page-router disable-hl">
                <FiArrowLeftCircle className='left-arrow' onClick={ (() => this.setPrevPage()) } />
                Page: { this.state.page.pageNumber }
                <FiArrowRightCircle className='right-arrow' onClick={ (() => this.setNextPage()) } />
              </div>
            </div>
          </div>
        </div>
      );
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

export default Clans;