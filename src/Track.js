import React, { Component } from 'react';
import './Track.css';

class Track extends Component {
  render() {
    return (
      <div className="track-container">
        <div className="track-info">
            <p>{this.props.track.name}</p>
            
        </div>
      </div>
    );
  }
}

export default Track;
