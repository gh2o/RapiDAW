// vim: ts=2 sw=2

import React, { Component } from 'react';

import { TrackRow } from './TrackRow.js';

import FontIcon from 'material-ui/FontIcon';

import './Track.css';

class Track extends Component {
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
          this.pianoElements[i] = (<div className="piano-key black" key={i}></div>);
        } else {
          this.pianoElements[i] = (<div className="piano-key white" key={i}></div>);
        }
    }
    this.pianoElements.reverse();

    this.state = {
      mouseActive: false,
      activeNote: null,
    }
  }

  render() {
    var notesByPitch = {};
    for (let note of Object.values(this.props.notes)) {
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
        noteAdded={note => this.props.noteAddedCallback(this.props.track, note)}
        noteDeleted={note => this.props.noteDeletedCallback(this.props.track, note)}/>);
    }

    return (
      <div className="track-container"
           onContextMenu={evt => evt.preventDefault()}
           onMouseDown={evt => evt.button !== 2 && this.setState({mouseActive: true})}
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
