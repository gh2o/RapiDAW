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

    var MIDIroll = new Array(88);

    for (var i = 0; i < MIDIroll.length; i++) {
      MIDIroll[i] = <TrackRow name="THIS IS A TEST"/>;
    }

    var piano = [false, true, false,
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
    for (var i=0; i < piano.length; i++) {
        if (piano[i]) {
          piano[i] = (<div className="piano-key black"></div>);
        } else {
          piano[i] = (<div className="piano-key white"></div>); 
        }
    }
    piano.reverse();

    this.state = {
      piano: piano,
      midiRow: MIDIroll
    }
  }

  render() {
    var midiBody;
    if (this.state.midiRow.length) {
      midiBody = (
        <div className="piano-container">
          {this.state.midiRow}
        </div>
      );
    }

    return (
      <div className="track-container">
        <div className="track-info">
          <FontIcon className="material-icons close-link"  onClick={() => this.props.trackDeleteClicked(this.props.track)}>close</FontIcon>
          <br />
          <p>{this.props.track.name}</p>
        </div>

        <div className="pianoroll-container">
          <div className="piano">
            {this.state.piano}
          </div>
          {midiBody}
        </div>
    </div>
    );
  }
}

export default Track;
