import React, { Component, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import Error from '../modules/Error';
import Loader from '../modules/Loader';
import ClanBannerGenerator from '../modules/ClanBanner';
import * as apiRequest from '../modules/requests/API';
import * as Misc from '../Misc';

export class Clan extends Component {

  state = {
    status: {
      status: 'startingUp',
      statusText: `Loading Clan Details`,
      loading: true
    }
  }

  componentDidMount() {
    document.title = "Marvin - Clan";
    this.GetClan();
  }

  GetClan() {
    const clanID = "2099336";
    apiRequest.GetClan({ clanID }).then((data) => {
      if(!data?.isError) {
        if(data.message === "Success") {
          this.setState({
            status: { status: 'ready', statusText: `Finished grabbing clan data.`, loading: false },
            clan: data.data[0]
          });
        }
        else if(data.message === "Not Found") { this.setState({ status: { status: 'error', statusText: `Clan was not found`, loading: false } }); }
        else { this.setState({ status: { status: 'error', statusText: data.data, loading: false } }); }
      }
      else { this.setState({ status: { status: 'error', statusText: data.data, loading: false } }); }
    });
  }

  render() {
    const { status, statusText } = this.state.status;
    const clan = this.state.clan;
    if(status === "error") { return (<Error error={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          <div className="clan-banner-container">
            <ClanBannerGenerator clanID={ clan.clanID } clanBanner={ clan.clanBanner } width="180px" height="240px" />
          </div>
        </div>
      );
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

export default Clan;