import React, { Component } from 'react';

export class Commands extends Component {

  state = { }

  componentDidMount() { document.title = "Marvin - Commands"; }

  render() {
    return(
      <div className="page-content" style={{ overflow: "hidden" }}>
        <div className="commands-content">
          <div className="categories">
            <div className="category-long">
              <div className="category-title">Items</div>
              <div className="category-paragraph">
                <div style={{ fontSize: "15px" }}>
                  <p className="para">You can use the item command on any profile collectible that is found in the Destiny 2 collections tab.</p>
                  <p className="para"><span className="d_highlight">~item anarchy</span> it will return a list of people who own the anarchy item.</p>
                  <p className="para"><span className="d_highlight">~!item anarchy</span> it will return a list of people who are missing the anarchy item.</p>
                  <p className="para">Notice by using the <span className="d_highlight">!</span> not operator in the command. It will return the opposite.</p>
                  <p className="para">If you are more versed in the API feel free to use hashes. The item command accepts exact names, item hashes or collectible hashes. <span className="d_highlight">~item 2220014607</span></p>
                </div>
              </div>
            </div>
            <div className="category-long">
              <div className="category-title">Titles</div>
              <div className="category-paragraph">
                <div style={{ fontSize: "15px" }}>
                  <p className="para">You can use the title command with any title in Destiny 2.</p>
                  <p className="para"><span className="d_highlight">~title wayfarer</span> it will return a list of people who own the wayfarer title.</p>
                  <p className="para"><span className="d_highlight">~!title wayfarer</span> will return a list of people who are missing the title.</p>
                  <p className="para">Notice by using the <span className="d_highlight">!</span> not operator in the command. It will return the opposite.</p>
                  <p className="para">If you are more versed in the API feel free to use hashes. The title command accepts the completion record hash for the title. <span className="d_highlight">~title 758645239</span></p>
                </div>
              </div>
            </div>
            <div className="category">
              <div className="category-title">Help</div>
              <div className="category-paragraph">
                <div className="category-row"><span className="d_highlight">~help rankings</span>, <span className="d_highlight">~rankings</span></div>
                <div className="category-row"><span className="d_highlight">~help dungeons</span>, <span className="d_highlight">~dungeons</span></div>
                <div className="category-row"><span className="d_highlight">~help raids</span>, <span className="d_highlight">~raids</span></div>
                <div className="category-row"><span className="d_highlight">~help items</span>, <span className="d_highlight">~items</span></div>
                <div className="category-row"><span className="d_highlight">~help titles</span>, <span className="d_highlight">~titles</span></div>
                <div className="category-row"><span className="d_highlight">~help seasonal</span>, <span className="d_highlight">~seasonal</span></div>
                <div className="category-row"><span className="d_highlight">~help clan</span>, <span className="d_highlight">~clan</span></div>
                <div className="category-row"><span className="d_highlight">~help broadcasts</span>, <span className="d_highlight">~broadcasts</span></div>
                <div className="category-row"><span className="d_highlight">~help trials</span>, <span className="d_highlight">~trials</span></div>
                <div className="category-row"><span className="d_highlight">~help clanwars</span>, <span className="d_highlight">~clanwars</span></div>
                <div className="category-row"><span className="d_highlight">~help others</span>, <span className="d_highlight">~others</span></div>
              </div>
            </div>
            <div className="category">
              <div className="category-title">Rankings</div>
              <div className="category-paragraph">
                <div className="category-row"><span className="d_highlight">~valor</span></div>
                <div className="category-row"><span className="d_highlight">~glory</span></div>
                <div className="category-row"><span className="d_highlight">~infamy</span></div>
                <div className="category-row"><span className="d_highlight">~iron banner</span></div>
                <div className="category-row"><span className="d_highlight">~triumph score</span></div>
                <div className="category-row"><span className="d_highlight">~season rank</span>, <span className="d_highlight">~sr</span></div>
                <div className="category-row"><span className="d_highlight">~time played</span>, <span className="d_highlight">~time</span></div>
                <div className="category-row"><span className="d_highlight">~highest power</span>, <span className="d_highlight">~power</span></div>
                <div className="category-row"><span className="d_highlight">~empire hunts</span></div>
                <div className="category-row"><span className="d_highlight">~presage</span></div>
                <div className="category-row"><span className="d_highlight">~master presage</span></div>
              </div>
            </div>
            <div className="category">
              <div className="category-title">Raids</div>
              <div className="category-paragraph">
                <div className="category-row"><span className="d_highlight">~leviathan</span>, <span className="d_highlight">~levi</span></div>
                <div className="category-row"><span className="d_highlight">~eater of worlds</span>, <span className="d_highlight">~eow</span></div>
                <div className="category-row"><span className="d_highlight">~spire of stars</span>, <span className="d_highlight">~sos</span></div>
                <div className="category-row"><span className="d_highlight">~last wish</span>, <span className="d_highlight">~lw</span></div>
                <div className="category-row"><span className="d_highlight">~scourge of the past</span>, <span className="d_highlight">~sotp</span></div>
                <div className="category-row"><span className="d_highlight">~crown of sorrows</span>, <span className="d_highlight">~cos</span></div>
                <div className="category-row"><span className="d_highlight">~garden of salvation</span>, <span className="d_highlight">~gos</span></div>
                <div className="category-row"><span className="d_highlight">~deep stone crypt</span>, <span className="d_highlight">~dsc</span></div>
              </div>
            </div>
            <div className="category">
              <div className="category-title">Dungeons</div>
              <div className="category-paragraph">
                <div className="category-row"><span className="d_highlight">~shattered throne</span></div>
                <div className="category-row"><span className="d_highlight">~pit of heresy</span></div>
                <div className="category-row"><span className="d_highlight">~prophecy</span></div>
              </div>
            </div>
            <div className="category">
              <div className="category-title">Clan</div>
              <div className="category-paragraph">
                <div className="category-row"><span className="d_highlight">~set clan</span></div>
                <div className="category-row"><span className="d_highlight">~add clan</span></div>
                <div className="category-row"><span className="d_highlight">~remove clan</span></div>
                <div className="category-row"><span className="d_highlight">~tracked clans</span></div>
              </div>
            </div>
            <div className="category">
              <div className="category-title">Broadcasts</div>
              <div className="category-paragraph">
                <div className="category-row"><span className="d_highlight">~set broadcasts #channel</span></div>
                <div className="category-row"><span className="d_highlight">~remove broadcasts</span></div>
                <div className="category-row"><span className="d_highlight">~manage broadcasts</span></div>
                <div className="category-row"><span className="d_highlight">~toggle item broadcasts</span></div>
                <div className="category-row"><span className="d_highlight">~toggle title broadcasts</span></div>
                <div className="category-row"><span className="d_highlight">~toggle clan broadcasts</span></div>
              </div>
            </div>
            <div className="category">
              <div className="category-title">Announcements</div>
              <div className="category-paragraph">
                <div className="category-row"><span className="d_highlight">~set announcements #channel</span></div>
                <div className="category-row"><span className="d_highlight">~remove announcements</span></div>
                <div className="category-row"><span className="d_highlight">~manage announcements</span></div>
                <div className="category-row"><span className="d_highlight">~toggle update announcements</span></div>
                <div className="category-row"><span className="d_highlight">~toggle gunsmith announcements</span></div>
              </div>
            </div>
            <div className="category">
              <div className="category-title">Others</div>
              <div className="category-paragraph">
                <div className="category-row"><span className="d_highlight">~donate</span></div>
                <div className="category-row"><span className="d_highlight">~clan activity</span></div>
                <div className="category-row"><span className="d_highlight">~profile</span></div>
                <div className="category-row"><span className="d_highlight">~profile -raids</span> ~profile -r</div>
                <div className="category-row"><span className="d_highlight">~profile -broadcasts</span> ~profile -b</div>
                <div className="category-row"><span className="d_highlight">~triumph score -active</span></div>
                <div className="category-row"><span className="d_highlight">~triumph score -legacy</span></div>
                <div className="category-row"><span className="d_highlight">~triumph score -lifetime</span></div>
                <div className="category-row"><span className="d_highlight">~legend</span> Daily legend lost sector</div>
                <div className="category-row"><span className="d_highlight">~master</span> Daily master lost sector</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Commands;