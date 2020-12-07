import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Config from '../Config';
import * as Misc from '../Misc';
import * as apiRequest from '../modules/API';

export class Header extends Component {

  state = {
    loggedIn: false,
    isAdmin: false,
    showCopied: false,
    platforms: null
  }

  async componentDidMount() {
    this.getPlatforms();
  }

  GotoAuth() {
    this.props.setPage("home");
    window.location.href = `https://www.bungie.net/en/oauth/authorize?client_id=${ Config.client_Id }&response_type=code&state=1`;
  }

  getPlatforms() {
    if(localStorage.getItem("adminToken")) {
      const adminToken = localStorage.getItem("adminToken");
      apiRequest.CheckAuthorization({ token: adminToken }).then((response) => { if(response.code === 200) { this.setState({ isAdmin: true }); } });
    }
    if(localStorage.getItem("DestinyMemberships")) {
      let BungieMemberships = JSON.parse(localStorage.getItem("DestinyMemberships"));
      let platforms = [];
      for(var i in BungieMemberships) {
        platforms.push({
          "platform": Misc.getPlatformName(BungieMemberships[i].membershipType),
          "name": BungieMemberships[i].displayName,
          "id": BungieMemberships[i].membershipId
        });
      }
      this.setState({ loggedIn: true, platforms });
    }
  }
  setPlatform(event) {
    var selectedMbmId = event.target.id;
    localStorage.setItem("SelectedAccount", JSON.stringify(this.state.platforms.find(e => e.id === selectedMbmId)));
    this.setState(this.state);
  }

  toggleMenuSlider() { console.log("Toggled Menu"); }
  toggleSettingsModal() {
    console.log("Toggled");
    this.props.toggleSettingsModal();
  }
  showMembershipId() {
    this.setState({ showCopied: true, });
    setTimeout(() => { this.setState({ showCopied: false, }); }, 10000);
  }

  render() {
    const { loggedIn, isAdmin, platforms } = this.state;    
    return (
      <header className="header">
        <div className="top-header">
          <div className="header-logo">
            <img src="/images/icons/logo.png" alt="logo" />
            <div className="header-home-link">Marvin</div>
          </div>
          <div className="header-user-containter">
          {
            loggedIn ? (
              <div className="header-username">
                {
                  localStorage.getItem("SelectedAccount") === "Please Select Platform" ? ( <div>{ localStorage.getItem("SelectedAccount") }</div> ) :
                  (
                    <div className="platformSelection">
                      <div className="platformName">
                        <img alt="platformLogo" src={`./images/icons/platforms/${ (JSON.parse(localStorage.getItem("SelectedAccount")).platform).toLowerCase() }.png`} />
                        <div onClick={ () => this.showMembershipId() }>{ JSON.parse(localStorage.getItem("SelectedAccount")).name }</div>
                      </div>
                      <div className={ this.state.showCopied ? 'platformMbmId show' : 'platformMbmId' }>{ JSON.parse(localStorage.getItem("SelectedAccount")).id }</div>
                    </div>
                  )
                }
                {
                  localStorage.getItem("SelectedAccount") === "Please Select Platform" ? (
                    platforms.map(function(platform) {
                      return (
                        <div className="platformSelection">
                          <img alt="platformLogo" src={`./images/icons/platforms/${ (platform.platform).toLowerCase() }.png`} />
                          <div onClick={ ((e) => this.setPlatform(e)) } id={ platform.id }>{ platform.name }</div>
                        </div>
                      )
                    }, this)
                  ) : null
                }
              </div>
            ) : ( <div className="header-login-link" onClick={ (() => this.GotoAuth()) }>Connect</div> )
          }
          </div>
        </div>
        <div className="left-header">
          <div className="header-menu">
            <div className={ `header-menu-item ${ this.props.currentPage === "home" ? "active" : "" }` }>
              <img alt="home-icon" className="header-menu-item-icon" src="/images/icons/home.png" />
              <Link className="header-link" to="/home" onClick={ () => this.props.setPage("home") }>Home</Link>
              <img alt="arrow-icon" className="header-menu-item-arrow" src="/images/icons/arrow.png" />
            </div>
            <div className={ `header-menu-item ${ this.props.currentPage === "commands" ? "active" : "" }` }>
              <img alt="clans-icon" className="header-menu-item-icon" src="/images/icons/clans.png" />
              <Link className="header-link" to="/clans" onClick={ () => this.props.setPage("commands") }>Commands</Link>
              <img alt="arrow-icon" className="header-menu-item-arrow" src="/images/icons/arrow.png" />
            </div>
            {
              isAdmin ? (
                <React.Fragment>
                  <div className={ `header-menu-item ${ this.props.currentPage === "status" ? "active" : "" }` }>
                    <img alt="discord-icon" className="header-menu-item-icon" src="/images/icons/discord.png" />
                    <Link className="header-link" to="/status" onClick={ () => this.props.setPage("status") }>Status</Link>
                    <img alt="arrow-icon" className="header-menu-item-arrow" src="/images/icons/arrow.png" />
                  </div>
                  <div className={ `header-menu-item ${ this.props.currentPage === "logs" ? "active" : "" }` }>
                    <img alt="discord-icon" className="header-menu-item-icon" src="/images/icons/logs.png" />
                    <Link className="header-link" to="/logs" onClick={ () => this.props.setPage("logs") }>Logs</Link>
                    <img alt="arrow-icon" className="header-menu-item-arrow" src="/images/icons/arrow.png" />
                  </div>
                </React.Fragment>
              ) : null
            }
          </div>
          <div className="donation-links">
            <a href="https://paypal.me/guardianstats" className="donate-link" id="paypal"><img src="./images/icons/paypal.png" width="26px" height="26px" /></a>
            <a href="https://www.patreon.com/Terrii" className="donate-link" id="patreon"><img src="./images/icons/patreon.png" width="26px" height="26px" /></a>
            <a href="https://ko-fi.com/terrii_dev" className="donate-link" id="kofi"><img src="./images/icons/kofi.png" width="26px" height="26px" />Buy me a coffee?</a>
          </div>
        </div>
      </header>
    )
  }
}

export default Header;
