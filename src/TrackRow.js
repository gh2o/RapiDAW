import React, { Component } from 'react';
import { TrackCell } from './TrackCell.js';
import './Track.css';

class TrackRow extends Component {
  handleKeyDown(event) {
    console.log(event);
  }

  handleDrag(event) {
    console.log(event);
  }

  render() {
    return (
      <div
        className="track-row-container"
        onDrag={this.handleDrag}
        onClick={this.handleKeyDown} >
        DUH HELLO
      </div>
    );
  }
}

export {TrackRow};
