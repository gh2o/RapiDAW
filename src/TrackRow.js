// vim: ts=2 sw=2

import React, { Component } from 'react';
import TrackCell from './TrackCell.js';
import { MIDINote } from './MIDIDatastore.js';
import { generateID } from './Utils.js';
import './Track.css';

export const PIXELS_PER_BEAT = 40;

class TrackRow extends Component {
  constructor() {
    super();
    this.handleMouseDownOrMove = this.handleMouseDownOrMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.noteDeleteClicked = this.noteDeleteClicked.bind(this);
    this.state = {
      notes: [],
      mouseX: 0,
      mouseY: 0,
      mouseIn: false
    };
  }

  getOffsetForEventX(x) {
    var rect = this.rowDiv.getBoundingClientRect();
    return x - rect.left;
  }

  roundBeat(beat) {
    return Math.floor(beat * 2) / 2;
  }

  handleMouseDownOrMove(evt) {
    this.setState({
      mouseX: evt.pageX,
      mouseY: evt.pageY,
      mouseIn: true
    });
  }

  handleMouseUp(evt) {
    if (this.props.mouseActive) {
      var offsetPx = this.getOffsetForEventX(evt.pageX);
      var beat = offsetPx / PIXELS_PER_BEAT;
      beat = this.roundBeat(beat);
      var note = new MIDINote(generateID(), beat, 1, this.props.pitch);
      this.props.noteAdded(note);
    }
  }

  noteDeleteClicked(note) {
    this.props.noteDeleted(note);
  }

  render() {
    var cells = [];
    for (let note of this.props.notes) {
      cells.push(<TrackCell
        key={note.id}
        beat={note.beat}
        note={note}
        noteDeleteClicked={this.noteDeleteClicked}/>);
    }
    if (this.state.mouseIn && this.props.mouseActive) {
      let beat = this.getOffsetForEventX(this.state.mouseX) / PIXELS_PER_BEAT;
      beat = this.roundBeat(beat);
      cells.push(<TrackCell
        key="TEMP"
        beat={beat}/>);
    }
    return (
      <div
        className="track-row-container"
        onMouseDown={this.handleMouseDownOrMove}
        onMouseMove={this.handleMouseDownOrMove}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={() => {this.setState({mouseIn: false})}}
        ref={(div) => { this.rowDiv = div; }}>
        {cells}
      </div>
    );
  }
}

export {TrackRow};
