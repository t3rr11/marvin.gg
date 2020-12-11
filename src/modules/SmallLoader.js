import React, { Component } from 'react';
import Lottie from 'react-lottie';
import abilityLoader from '../loaders/abilityLoader.json';
import classLoader from '../loaders/classLoader.json';

const abilityLoaderOptions = { loop: true, autoplay: true, animationData: abilityLoader, rendererSettings: { preserveAspectRatio: 'xMidYMid slice' } };
const classLoaderOptions = { loop: true, autoplay: true, animationData: classLoader, rendererSettings: { preserveAspectRatio: 'xMidYMid slice' } };

export class Loader extends Component {

  render() {
    var loader = "class";
    if(loader === "class") {
      return (
        <div className="smallLoaderBG">
          { this.props.error ? <img src="./images/icons/error.png" /> : <Lottie options={ classLoaderOptions } height={70} width={50} isStopped={false} isPaused={false} /> }
          <div className="smallLoaderText">
            <p> { this.props.statusText } </p>
          </div>
        </div>
      );
    }
  }
}

export default Loader;
