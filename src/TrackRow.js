// vim: ts=2 sw=2

import React, { Component } from 'react';
import { TrackCell } from './TrackCell.js';
import { MIDINote } from './MIDIDatastore.js';
import { generateID } from './Utils.js';
import './Track.css';

const PIXELS_PER_BEAT = 40;

class TrackRow extends Component {
  constructor() {
    super();
    this.handleMouseDownOrMove = this.handleMouseDownOrMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
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

  handleMouseDownOrMove(evt) {
    this.setState({
      mouseX: evt.pageX,
      mouseY: evt.pageY,
      mouseIn: true
    });
  }

  handleMouseUp(evt) {
    var offsetPx = this.getOffsetForEventX(evt.pageX);
    var beat = offsetPx / PIXELS_PER_BEAT;
    beat = Math.round(beat * 2) / 2;
    var note = new MIDINote(generateID(), beat, 1, this.props.pitch);
    this.props.noteAdded(note);

    /*
    console.log(rect.top, rect.right, rect.bottom, rect.left);

    this.setState({
      pressed: !this.state.pressed,
      released: !this.state.released,
      position: event.pageX - rect.left
    });

    console.log(this.state.pressed);
    */
  }

  render() {
    var cells = [];
    for (let note of this.props.notes) {
      cells.push(<TrackCell key={note.id} position={note.beat * PIXELS_PER_BEAT}/>);
    }
    if (this.state.mouseIn && this.props.mouseActive) {
      cells.push(<TrackCell key="TEMP" position={this.getOffsetForEventX(this.state.mouseX)}/>);
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
