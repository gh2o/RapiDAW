// vim: sw=2 ts=2

import React, { Component } from 'react';
import './Track.css';

class Track extends Component {
  render() {
    return (
      <div className="track-container">
        <div className="track-info">
          <p>{this.props.track.name}</p>
          <a className="close-link" onClick={() => this.props.trackDeleteClicked(this.props.track)}>x</a>
      	</div>
        <div className="piano-container">
            {for (int i=0; i<88; i++) {
                return(<div className="piano-row">);
            }}
        </div>
      </div>
    );
  }
}

export default Track;
