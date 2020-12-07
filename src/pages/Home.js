import React, { Component } from 'react';
import { Gallery, GalleryImage } from 'react-gesture-gallery';
import Loader from '../modules/Loader';
import * as Misc from '../Misc';

const images = ["1.png", "1_1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png", "9.png", "10.png", "11.png", "12.png", "13.png"];
var galleryScroller;

export class Home extends Component {

  state = {
    index: 0,
    users: 0,
    guilds: 0
  }

  setIndex(i) { this.setState({ index: i }); }
  componentDidMount() {
    document.title = "Marvin - Home";
    galleryScroller = setInterval(() => { if(this.state.index === images.length - 1) { this.setIndex(0) } else { this.setIndex(this.state.index + 1) }  }, 5000);
    return fetch('https://api.marvin.gg/GetFrontendStatus', { method: 'GET' }).then((response) => response.json()).then(async (response) => {
      if(!response.isError) { this.setState({ users: response.data[0].users, guilds: response.data[0].servers }); }
    })
    .catch((err) => { console.log(err); });
  }
  componentWillUnmount() { clearInterval(galleryScroller); galleryScroller = null; }
  gotoMarvin() { window.open('https://discordapp.com/oauth2/authorize?client_id=631351366799065088&scope=bot&permissions=8', '_blank'); }

  render() {
    const { users, guilds } = this.state;
    return(
      <div className="page-content" style={{ overflow: "hidden" }}>
        <div className="home-content">
          <div className="howToConnect">
            <div className="connectContainer">
              <h2 style={{ textAlign: "center", margin: "10px", marginBottom: "-20px" }}>Marvin | The Clan Bot</h2>
              <div className="statusLabels">
                <div className="usersStatusLabel">Users: { Misc.AddCommas(users) }</div>
                <div className="guildsStatusLabel">Servers: { Misc.AddCommas(guilds) }</div>
              </div>
              <div className="animatedLogo"><Loader custom={{ loader: "logo", height: "200px", width: "200px" }} /></div>
              <div className="marvinBtn"><button className="btn btn-primary" onClick={ (() => this.gotoMarvin()) }>Invite</button></div>
            </div>
            <h2 className="paraTitle">Why would you want Marvin?</h2>
            <div className="paraContainer">
              <p className="para">Marvin's purpose is to help your clan grow. He creates scoreboards and broadcasts clan achievements like hitting legend and those moments of luck where someone gets a raid exotic!</p>
              <p className="para">He can be useful for many reasons, if you are a clan owner and you feel like your clan needs a bit of spark adding Marvin can help increase the total active time your clan plays as it helps promote healthy competition and more chatter between clan memebers when someone gets a unique or new item.</p>
              <p className="para">Another way he can promote activity is via the leaderboards. If a user sees that they are close to hitting rank 1 in a specific leaderboard they may play more to secure that rank 1 position and claim them bragging rights!</p>
              <p className="para">Marvin is a great bot to have to see who your most active members are, if you use the <span className="d_highlight">~glory</span> command for example you might find people who you were not aware pvp'd much in your clan, so you could ask them to help you out? Same goes with raids and other activities!</p>
            </div>
          </div>
          <div className="features">
            <div>
              <h3 style={{ textAlign: "center", margin: "10px" }}>Features</h3>
              <div className="marvinsDisplayImages">
                <Gallery index={this.state.index} onRequestChange={i => { this.setIndex(i) }} enableControls={ false } enableIndicators={ false }>
                  { images.map(image => ( <GalleryImage objectFit="contain" src={`/images/marvin/${image}`} /> )) }
                </Gallery>
              </div>
            </div>
            <h2 className="paraTitle">How to Setup</h2>
            <div className="paraContainer">
              <p className="para">To invite marvin to your server use the invite button above. Follow the discord prompts and he will be there!</p>
              <p className="para">To get Marvin to track your clan you will need to register first so Marvin knows who you are and what clan you are in. You see how by using this command: <span className="d_highlight">~register</span></p>
              <p className="para">Once registered it is time to register your clan. Use: <span className="d_highlight">~set clan</span> this will add your clan to list to be scanned then wait for a message letting you know when he has finished the first scan for your clan.</p>
              <p className="para">Whilst Marvin is scanning your clan feel free to use this time to setup broadcasts. Use: <span className="d_highlight">~set broadcasts</span> to enable clan broadcasts!</p>
              <p className="para">You can try some of the commands from the help menu using: <span className="d_highlight">~help</span> Enjoy!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;