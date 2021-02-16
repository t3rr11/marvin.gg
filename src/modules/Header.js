import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Config from '../Config';
import * as Misc from '../Misc';
import * as apiRequest from '../modules/requests/API';
import * as discord from '../modules/requests/DiscordAuth';
import { generate } from 'build-number-generator';

export class Header extends Component {

  state = {
    loggedIn: false,
    isAdmin: false,
    showCopied: false,
    platforms: null,
    discordInfo: null,
    menuOpen: false
  }

  async componentDidMount() {
    this.checkLogin();
  }

  GotoAuth() { this.setPage("home"); discord.linkWithDiscord(); }

  checkLogin() {
    if(localStorage.getItem("adminToken")) {
      const adminToken = localStorage.getItem("adminToken");
      apiRequest.CheckAuthorization({ token: adminToken }).then((response) => { if(response.code === 200) { this.setState({ isAdmin: true }); } });
    }
    if(this.props.discordInfo) { this.setState({ loggedIn: true, discordInfo: this.props.discordInfo }); }
  }
  toggleMenuSlider() {
    this.setState({ menuOpen: !this.state.menuOpen });
    console.log("Toggled Menu");
  }
  hideMenuSlider() { this.setState({ menuOpen: false }); }
  setPage = (page) => {
    this.props.setPage(page);
    this.toggleMenuSlider();
  }
  setSubPage = (page) => {
    this.props.setSubPage(page);
    this.toggleMenuSlider();
  }

  componentDidUpdate() {
    if(this.props.discordInfo && !this.state.discordInfo) { this.setState({ loggedIn: true, discordInfo: this.props.discordInfo }); }
  }

  render() {
    const { loggedIn, isAdmin, discordInfo } = this.state;
    const leftHeader = (
      <>
        <div className="header-menu">
            <div className={`header-menu-item-container ${ this.props.currentPage === "home" ? "active" : "" }`}>
                <div className={ `header-menu-item ${ this.props.currentPage === "home" ? "active" : "" }` }>
                  <img alt="home-icon" className="header-menu-item-icon" src="/images/icons/home.png" />
                  <Link className="header-link" to="/home" onClick={ () => this.setPage("home") }>Home</Link>
                  <img alt="arrow-icon" className={`header-menu-item-arrow ${ this.props.currentPage === "home" ? "active" : "" }`} src="/images/icons/arrow.png" />
                </div>
              </div>
              <div className={`header-menu-item-container ${ this.props.currentPage === "commands" ? "active" : "" }`}>
                <div className={ `header-menu-item ${ this.props.currentPage === "commands" ? "active" : "" }` }>
                  <img alt="clans-icon" className="header-menu-item-icon" src="/images/icons/info.png" />
                  <Link className="header-link" to="/commands" onClick={ () => this.setPage("commands") }>Commands</Link>
                  <img alt="arrow-icon" className={`header-menu-item-arrow ${ this.props.currentPage === "commands" ? "active" : "" }`} src="/images/icons/arrow.png" />
                </div>
              </div>
              <div className={`header-menu-item-container ${ this.props.currentPage === "clans" ? "active" : "" }`}>
                <div className={ `header-menu-item ${ this.props.currentPage === "clans" || this.props.currentPage === "clan" ? "active" : "" }` }>
                  <img alt="clans-icon" className="header-menu-item-icon" src="/images/icons/clans.png" />
                  <Link className="header-link" to="/clans" onClick={ () => this.setPage("clans") }>Clans</Link>
                  <img alt="arrow-icon" className={`header-menu-item-arrow ${ this.props.currentPage === "clans" ? "active" : "" }`} src="/images/icons/arrow.png" />
                </div>
              </div>
              <div className={`header-menu-item-container ${ this.props.currentPage === "dashboard" ? "active" : "" }`}>
                <div className={ `header-menu-item ${ this.props.currentPage === "dashboard" ? "active" : "" }` }>
                  <img alt="discord-icon" className="header-menu-item-icon" src="/images/icons/dashboard.png" />
                  <Link className="header-link" to="/dashboard" onClick={ () => this.setPage("dashboard") }>Dashboard</Link>
                  <img alt="arrow-icon" className={`header-menu-item-arrow ${ this.props.currentPage === "dashboard" ? "active" : "" }`} src="/images/icons/arrow.png" />
                </div>
                <div className={`sub-menu-items ${ this.props.currentPage === "dashboard" ? "active" : "" }`}>
                  <div className={`sub-menu-item ${ this.props.currentSubPage === "serverDetails" ? "active" : "" }`} onClick={ () => this.setSubPage("serverDetails") }>Server Details</div>
                  <div className={`sub-menu-item ${ this.props.currentSubPage === "serverRankings" ? "active" : "" }`} onClick={ () => this.setSubPage("serverRankings") }>Server Rankings</div>
                  <div className={`sub-menu-item ${ this.props.currentSubPage === "manageMarvin" ? "active" : "" }`} onClick={ () => this.setSubPage("manageMarvin") }><s>Manage Marvin</s></div>
                </div>
              </div>
              {
                this.props.currentPage === "guild" || this.props.currentPage === "leaderboards" || loggedIn ? (
                  <div className={`header-menu-item-container ${ this.props.currentPage === "guild" || this.props.currentPage === "leaderboards" ? "active" : "" }`}>
                    <div className={ `header-menu-item ${ this.props.currentPage === "guild" || this.props.currentPage === "leaderboards" ? "active" : "" }` }>
                      <img alt="discord-icon" className="header-menu-item-icon" src="/images/icons/graph.png" />
                      <Link className="header-link" to="/leaderboards" onClick={ () => this.setPage("leaderboards") }>Leaderboards</Link>
                      <img alt="arrow-icon" className={`header-menu-item-arrow ${ this.props.currentPage === "guild" || this.props.currentPage === "leaderboards" ? "active" : "" }`} src="/images/icons/arrow.png" />
                    </div>
                    <div className={`sub-menu-items ${ this.props.currentPage === "guild" || this.props.currentPage === "leaderboards" ? "active" : "" } transScrollbar`}>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "valor" ? "active" : "" }`} onClick={ () => this.setSubPage("valor") }>Valor</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "glory" ? "active" : "" }`} onClick={ () => this.setSubPage("glory") }>Glory</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "infamy" ? "active" : "" }`} onClick={ () => this.setSubPage("infamy") }>Infamy</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "seasonRank" ? "active" : "" }`} onClick={ () => this.setSubPage("seasonRank") }>Season Rank</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "timePlayed" ? "active" : "" }`} onClick={ () => this.setSubPage("timePlayed") }>Time Played</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "highestPower" ? "active" : "" }`} onClick={ () => this.setSubPage("highestPower") }>Highest Power</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "ironBanner" ? "active" : "" }`} onClick={ () => this.setSubPage("ironBanner") }>Iron Banner</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "levi" ? "active" : "" }`} onClick={ () => this.setSubPage("levi") }>Leviathan Clears</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "eow" ? "active" : "" }`} onClick={ () => this.setSubPage("eow") }>Eater of Worlds Clears</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "sos" ? "active" : "" }`} onClick={ () => this.setSubPage("sos") }>Spire of Stars Clears</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "pLevi" ? "active" : "" }`} onClick={ () => this.setSubPage("pLevi") }>Prestige Levi Clears</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "pEoW" ? "active" : "" }`} onClick={ () => this.setSubPage("pEoW") }>Prestige EoW Clears</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "pSoS" ? "active" : "" }`} onClick={ () => this.setSubPage("pSoS") }>Prestige SoS Clears</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "lastWish" ? "active" : "" }`} onClick={ () => this.setSubPage("lastWish") }>Last Wish Clears</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "scourge" ? "active" : "" }`} onClick={ () => this.setSubPage("scourge") }>Scourge of the Past</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "sorrows" ? "active" : "" }`} onClick={ () => this.setSubPage("sorrows") }>Crown of Sorrows</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "garden" ? "active" : "" }`} onClick={ () => this.setSubPage("garden") }>Garden of Salvation</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "dsc" ? "active" : "" }`} onClick={ () => this.setSubPage("dsc") }>Deep Stone Crypt</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "shatteredThrone" ? "active" : "" }`} onClick={ () => this.setSubPage("shatteredThrone") }>Shattered Throne</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "pitOfHeresy" ? "active" : "" }`} onClick={ () => this.setSubPage("pitOfHeresy") }>Pit of Heresy</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "prophecy" ? "active" : "" }`} onClick={ () => this.setSubPage("prophecy") }>Prophecy</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "totalRaids" ? "active" : "" }`} onClick={ () => this.setSubPage("totalRaids") }>Total Raid Clears</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "activeScore" ? "active" : "" }`} onClick={ () => this.setSubPage("activeScore") }>Active Triumph Score</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "legacyScore" ? "active" : "" }`} onClick={ () => this.setSubPage("legacyScore") }>Legacy Triumph Score</div>
                      <div className={`sub-menu-item ${ this.props.currentSubPage === "lifetimeScore" ? "active" : "" }`} onClick={ () => this.setSubPage("lifetimeScore") }>Lifetime Triumph Score</div>
                    </div>
                  </div>
                ) : null
              }
              {
                isAdmin ? (
                  <React.Fragment>
                    <div className={`header-menu-item-container ${ this.props.currentPage === "logs" ? "active" : "" }`}>
                      <div className={ `header-menu-item ${ this.props.currentPage === "logs" ? "active" : "" }` }>
                        <img alt="discord-icon" className="header-menu-item-icon" src="/images/icons/logs.png" />
                        <Link className="header-link" to="/logs" onClick={ () => this.setPage("logs") }>Logs</Link>
                        <img alt="arrow-icon" className={`header-menu-item-arrow ${ this.props.currentPage === "logs" ? "active" : "" }`} src="/images/icons/arrow.png" />
                      </div>
                    </div>
                    <div className={`header-menu-item-container ${ this.props.currentPage === "status" ? "active" : "" }`}>
                      <div className={ `header-menu-item ${ this.props.currentPage === "status" ? "active" : "" }` }>
                        <img alt="discord-icon" className="header-menu-item-icon" src="/images/icons/discord.png" />
                        <Link className="header-link" to="/status" onClick={ () => this.setPage("status") }>Status</Link>
                        <img alt="arrow-icon" className={`header-menu-item-arrow ${ this.props.currentPage === "status" ? "active" : "" }`} src="/images/icons/arrow.png" />
                      </div>
                    </div>
                    <div className={`header-menu-item-container ${ this.props.currentPage === "graphs" ? "active" : "" }`}>
                      <div className={ `header-menu-item ${ this.props.currentPage === "graphs" ? "active" : "" }` }>
                        <img alt="discord-icon" className="header-menu-item-icon" src="/images/icons/graph.png" />
                        <Link className="header-link" to="/graphs" onClick={ () => this.setPage("graphs") }>Graphs</Link>
                        <img alt="arrow-icon" className={`header-menu-item-arrow ${ this.props.currentPage === "graphs" ? "active" : "" }`} src="/images/icons/arrow.png" />
                      </div>
                    </div>
                  </React.Fragment>
                ) : null
              }
            </div>
        <div className="background-colors">
              <div className="auto-color-box" style={ localStorage.getItem("background") === "Auto" ?  { border: "1px solid white", margin: "1px", marginTop: "10px" } : { } } onClick={ (() => this.props.setBackground("Auto")) }>Auto</div>
              { 
                this.props.backgrounds.map((bg) => {
                  let style;
                  if(this.props.currentBackground === bg) { style = { background: `var(--${ bg })`, border: `1px solid white` } }
                  else { style = { background: `var(--${ bg })` } }
                  return <div className="color-box" style={ style } onClick={ (() => this.props.setBackground(bg)) }></div>
                })
              }
            </div>
        <div className="donation-links">
              <a href="https://paypal.me/guardianstats" className="donate-link" id="paypal"><img src="/images/icons/paypal.png" width="26px" height="26px" /></a>
              <a href="https://www.patreon.com/Terrii" className="donate-link" id="patreon"><img src="/images/icons/patreon.png" width="26px" height="26px" /></a>
              <a href="https://ko-fi.com/terrii_dev" className="donate-link" id="kofi"><img src="/images/icons/kofi.png" width="26px" height="26px" />Buy me a coffee?</a>
            </div>
        <div className="footer">Beta { generate({ version: this.props.siteVersion, versionSeparator: "-" })}</div>
      </>
    );
    return (
      <header className="header">
        <div className="top-header">
          <div className="header-logo">
            <img src="/images/icons/logo.png" alt="logo" />
            <div className="header-home-link">Marvin</div>
          </div>
          <div className="header-user-containter">
          {
            loggedIn ? 
            (<div className="header-username">{ <div>{`${ discordInfo.username }#${ discordInfo.discriminator }`}</div> }</div>) :
            (<div className="header-login-link" onClick={ (() => this.GotoAuth()) }>Connect</div>)
          }
          </div>
        </div>
        <div className="left-header">
          { leftHeader }
        </div>
        <div className={`mobile-header${ this.state.menuOpen ? "" : " hidden" }`} style={{ background: `var(--${this.props.currentBackground})` }}>
          { leftHeader }
        </div>
        <div className="menu-slider-btn" onClick={ (() => this.toggleMenuSlider())}>
          ≡
        </div>
      </header>
    )
  }
}

export default Header;
