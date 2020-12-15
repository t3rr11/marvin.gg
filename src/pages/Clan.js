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
  }

  render() {
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error statusText={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content" style={{ overflow: "hidden" }}>
          
        </div>
      );
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

export default Clan;