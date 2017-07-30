// vim: ts=2 sw=2

import React, { Component } from 'react';
import { TrackRow, PIXELS_PER_BEAT, BEAT_SUBDIVISION } from './TrackRow.js'
import './Track.css';

class TrackCell extends Component {
  constructor() {
    super();
    this.state = {
      resizeMousePx: null
    };
  }

  render() {
    return (
      <div
        className="track-cell-container"
        style={this.getStyle()}
        onMouseDown={evt => {
          if (evt.button === 0) {
            if (this.props.note) {
              this.props.noteDragStarted(this.props.note);
            }
          }
        }}
        onContextMenu={evt => {
          evt.preventDefault();
          if (this.props.note) {
            this.props.noteDeleteClicked(this.props.note);
          }
        }}>
        <div
          className="track-cell-handle"
          onMouseDown={evt => {
            evt.stopPropagation();
            if (this.props.note) {
              this.props.noteResizeStarted(this.props.note, this);
            }
          }}>
        </div>
      </div>
    );
  }

  resizeUpdate(evt, rect) {
    this.setState({ resizeMousePx: evt.pageX - rect.left });
  }

  getStyle() {
    let duration;
    if (this.state.resizeMousePx === null) {
      duration = this.props.duration;
    } else {
      let endbeat = TrackRow.prototype.roundBeat(
        this.state.resizeMousePx / PIXELS_PER_BEAT);
      duration = Math.max(endbeat - this.props.beat, 1 / BEAT_SUBDIVISION);
    }
    return {
      left:(this.props.beat * PIXELS_PER_BEAT)+"px",
      width:(duration * PIXELS_PER_BEAT)+"px",
    };
  }
}

export default TrackCell;
