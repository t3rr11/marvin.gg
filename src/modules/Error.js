import React from 'react';

export class Error extends React.Component {

  render() {
    return(
      <div className="error-container">
        <div className="error-icon" style={{ backgroundImage: 'url("./images/icons/error.png")' }}></div>
        <p style={{ marginTop: '-35px' }}>{ this.props.error }</p>
      </div>
    );
  }
}

export default Error;
