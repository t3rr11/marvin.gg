import React, { Component } from 'react';
import { Images, ImageSlider } from '../modules/ImageSlider';
import Loader from '../modules/Loader';
import * as Misc from '../Misc';

var imageScroller;

export class Home extends Component {

  state = {
    index: 0,
    users: 0,
    guilds: 0
  }

  setIndex(i) { this.setState({ index: i }); }
  componentDidMount() {
    document.title = "Marvin - Home";
    //imageScroller = setInterval(() => { if(this.state.index === images.length - 1) { this.setIndex(0) } else { this.setIndex(this.state.index + 1) }  }, 5000);
    return fetch('https://api.marvin.gg/GetFrontendStatus', { method: 'GET' }).then((response) => response.json()).then(async (response) => {
      if(!response.isError) { this.setState({ users: response.data[0].users, guilds: response.data[0].servers }); }
    })
    .catch((err) => { console.log(err); });
  }
  componentWillUnmount() { clearInterval(imageScroller); imageScroller = null; }
  gotoMarvin() { window.open('https://discordapp.com/oauth2/authorize?client_id=631351366799065088&scope=bot&permissions=8', '_blank'); }
  joinMarvin() { window.open('https://marvin.gg/discord', '_blank'); }

  render() {
    const { users, guilds } = this.state;
    return(
      <div className="page-content" style={{ overflow: "hidden" }}>
        <div className="alert-bar">Hey there! Marvin recently went through a rebuild, commands have now changed to be slash commands so this website is a little outdated. To be fixed soon. - Terrii</div>
        <div className="home-content transScrollbar">
          <div className="howToConnect">
            <div className="connectContainer">
              <h2 style={{ textAlign: "center", margin: "10px", marginBottom: "-20px" }}>Marvin | The Clan Bot</h2>
              <div className="statusLabels">
                <div className="usersStatusLabel">Users: { Misc.AddCommas(users) }</div>
                <div className="guildsStatusLabel">Servers: { Misc.AddCommas(guilds) }</div>
              </div>
              <div className="animatedLogo"><Loader custom={{ loader: "logo", height: "200px", width: "200px" }} /></div>
              <div className="marvinBtn">
                <button className="btn btn-primary" onClick={ (() => this.gotoMarvin()) }>Invite Marvin</button>
                <button className="btn btn-primary" onClick={ (() => this.joinMarvin()) }>Join Support Server</button>
              </div>
            </div>
            <h2 className="paraTitle">Why would you want Marvin?</h2>
            <div className="paraContainer">
              <p className="para">Marvin's purpose is to help your clan grow. He creates scoreboards and broadcasts clan achievements like hitting legend and those moments of luck where someone gets a raid exotic!</p>
              <p className="para">He can be useful for many reasons, if you are a clan owner and you feel like your clan needs a bit of spark adding Marvin can help increase the total active time your clan plays as it helps promote healthy competition and more chatter between clan memebers when someone gets a unique or new item.</p>
              <p className="para">Another way he can promote activity is via the leaderboards. If a user sees that they are close to hitting rank 1 in a specific leaderboard they may play more to secure that rank 1 position and claim them bragging rights!</p>
              <p className="para">Marvin is a great bot to have to see who your most active members are, if you use the <span className="d_highlight">/leaderboard glory</span> command for example you might find people who you were not aware pvp'd much in your clan, so you could ask them to help you out? Same goes with raids and other activities!</p>
            </div>
          </div>
          <div className="howToSetup">
            <div className="features">
              <h3 style={{ textAlign: "center", margin: "10px" }}>Features</h3>
              <ImageSlider images={Images} />
            </div>
            <h2 className="paraTitle">How to Setup</h2>
            <div className="paraContainer">
              <p className="para">To invite marvin to your server use the invite button above. Follow the discord prompts and he will be there!</p>
              <p className="para">To get Marvin to track your clan you will need to register first so Marvin knows who you are and what clan you are in. You see how by using this command: <span className="d_highlight">/register</span></p>
              <p className="para">Once registered it is time to register your clan. Use: <span className="d_highlight">/clan setup</span> this will add your clan to list to be scanned (this first scan can take up to an hour)</p>
              <p className="para">Whilst Marvin is scanning your clan feel free to use this time to setup broadcasts. Use: <span className="d_highlight">/broadcasts channel</span> to enable clan broadcasts and use <span className="d_highlight">/broadcasts settings</span> to configure which broadcasts you'd like to see.</p>
              <p className="para">You can try some of the commands from the help menu using: <span className="d_highlight">/help</span> Enjoy!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;