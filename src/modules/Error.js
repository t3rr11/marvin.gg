import React from 'react';

export class Error extends React.Component {

  render() {
    return(
      <div className="page-content">
        <div className="error-container">
          <div className="error-icon" style={{ backgroundImage: 'url("./images/icons/error.png")' }}></div>
          <p className="error-text" style={{ marginTop: '-35px' }}>{ this.props.error }</p>
        </div>
      </div>
    );
  }
}

export default Error;
