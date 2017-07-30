import React, { Component } from 'react';
import './Track.css';

class TrackCell extends Component {

  render() {
    return (
      <div className="track-cell-container"
        style={this.getStyle()}>
      </div>
    );
  }

  getStyle() {
    var x = {
      left:(this.props.position)+"px"
    };
    console.log('getStyle', x);
    return x;
  }
}

export {TrackCell};
