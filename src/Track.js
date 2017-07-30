// vim: sw=2 ts=2

import React, { Component } from 'react';
import './Track.css';

class Track extends Component {
  render() {
    return (
      <div className="track-container">
        <div className="track-info">
          <p>{this.props.track.name}</p>
          <p><a onClick={() => this.props.trackDeleteClicked(this.props.track)}>DELETE</a></p>
      	</div>
      </div>
    );
  }
}

export default Track;
