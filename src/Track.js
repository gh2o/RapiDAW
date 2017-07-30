import React, { Component, PureComponent } from 'react';

import { MIDINote, MIDITrack, MIDIDatastore } from './MIDIDatastore.js';
import { TrackRow } from './TrackRow.js';
import { generateID } from './Utils.js';

import FontIcon from 'material-ui/FontIcon';

import './Track.css';

class Track extends PureComponent {
  constructor() {
    super();
    console.log("track constructor called");

    this.pianoElements = [false, true, false,
      false, true, false, true, false,
      false, true, false, true, false, true, false,
      false, true, false, true, false,
      false, true, false, true, false, true, false,
      false, true, false, true, false,
      false, true, false, true, false, true, false,
      false, true, false, true, false,
      false, true, false, true, false, true, false,
      false, true, false, true, false,
      false, true, false, true, false, true, false,
      false, true, false, true, false,
      false, true, false, true, false, true, false,
      false, true, false, true, false,
      false, true, false, true, false, true, false,
      false
    ];
    for (var i=0; i < this.pianoElements.length; i++) {
        if (this.pianoElements[i]) {
          this.pianoElements[i] = (<div className="piano-key black"></div>);
        } else {
          this.pianoElements[i] = (<div className="piano-key white"></div>);
        }
    }
    this.pianoElements.reverse();

    this.state = {
      mouseActive: false
    }
  }

  render() {
    var notesByPitch = {};
    for (let note of this.props.notes) {
      if (!(note.pitch in notesByPitch)) {
        notesByPitch[note.pitch] = [];
      }
      notesByPitch[note.pitch].push(note);
    }

    var trackRows = [];
    for (var i = 0; i < 88; i++) {
      let pitch = 87 - i;
      trackRows.push(<TrackRow
        key={pitch}
        pitch={pitch}
        notes={notesByPitch[pitch] || []}
        mouseActive={this.state.mouseActive}
        noteAdded={note => this.props.noteAddedCallback(this.props.track, note)}/>);
    }

    return (
      <div className="track-container"
           onMouseDown={() => this.setState({mouseActive: true})}
           onMouseUp={() => this.setState({mouseActive: false})}
           onMouseLeave={() => this.setState({mouseActive: false})}>
        <div className="track-info">
          <FontIcon className="material-icons close-link"  onClick={() => this.props.trackDeleteClicked(this.props.track)}>close</FontIcon>
          <br />
          <p>{this.props.track.name}</p>
        </div>
        <div className="pianoroll-container">
          <div className="piano">
            {this.pianoElements}
          </div>
          <div className="piano-container">
            {trackRows}
          </div>
        </div>
    </div>
    );
  }
}

export default Track;
