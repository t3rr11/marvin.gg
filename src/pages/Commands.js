import React, { Component } from 'react';

export class Commands extends Component {

  state = { }

  componentDidMount() { document.title = "Marvin - Commands"; }

  render() {
    return(
      <div className="page-content" style={{ overflow: "hidden" }}>
        <div className="commands-content">
          
        </div>
      </div>
    );
  }
}

export default Commands;