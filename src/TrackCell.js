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
    return {
      left:(this.props.position)+"px"
    };
  }
}

export {TrackCell};
