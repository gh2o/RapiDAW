// vim: ts=2 sw=2

import React, { Component } from 'react';
import { PIXELS_PER_BEAT } from './TrackRow.js'
import './Track.css';

class TrackCell extends Component {
  render() {
    return (
      <div
        className="track-cell-container"
        style={this.getStyle()}
        onContextMenu={evt => {
          evt.preventDefault();
          console.log('note del ctx');
        }}>
      </div>
    );
  }

  getStyle() {
    return {
      left:(this.props.beat * PIXELS_PER_BEAT)+"px"
    };
  }
}

export default TrackCell;
