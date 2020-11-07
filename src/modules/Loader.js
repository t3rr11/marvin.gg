import React from 'react';
import Lottie from 'react-lottie';
import abilityLoader from '../loaders/abilityLoader.json';
import classLoader from '../loaders/classLoader.json';
import logoLoader from '../loaders/logo.json';

const abilityLoaderOptions = { loop: true, autoplay: true, animationData: abilityLoader, rendererSettings: { preserveAspectRatio: 'xMidYMid slice' } };
const classLoaderOptions = { loop: true, autoplay: true, animationData: classLoader, rendererSettings: { preserveAspectRatio: 'xMidYMid slice' } };
const logoLoaderOptions = { loop: true, autoplay: true, animationData: logoLoader, rendererSettings: { preserveAspectRatio: 'xMidYMid slice' } };

export class Loader extends React.Component {

  render() {
    var loader = "class";
    if(localStorage.getItem("Settings")) { loader = JSON.parse(localStorage.getItem("Settings")).loader; }
    if(this.props.custom) {
      if(this.props.custom.loader === "class") { return (<Lottie options={ classLoaderOptions } height={this.props.custom.height} width={this.props.custom.width} isStopped={false} isPaused={false} />) }
      else if(this.props.custom.loader === "ability") { return (<Lottie options={ abilityLoaderOptions } height={this.props.custom.height} width={this.props.custom.width} isStopped={false} isPaused={false} />) }
      else if(this.props.custom.loader === "logo") { return (<Lottie options={ logoLoaderOptions } height={this.props.custom.height} width={this.props.custom.width} isStopped={false} isPaused={false} />) }
    }
    else {
      if(loader === "class") {
        return (
          <div className="loaderBG">
            <Lottie options={ classLoaderOptions } height={250} width={250} isStopped={false} isPaused={false} />
            <div className="loaderText">
              <p> { this.props.statusText } </p>
            </div>
          </div>
        );
      }
      else if(loader === "ability") {
        return (
          <div className="loaderBG">
            <Lottie options={ abilityLoaderOptions } height={250} width={250} isStopped={false} isPaused={false} />
            <div className="loaderText">
              <p> { this.props.statusText } </p>
            </div>
          </div>
        );
      }
    }
  }
}

export default Loader;
