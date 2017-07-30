import React, { Component } from 'react';

import { MIDINote, MIDITrack, MIDIDatastore } from './MIDIDatastore.js';
import { TrackRow } from './TrackRow.js';
import { TrackCell } from './TrackCell.js';
import { generateID } from './Utils.js';

import './Track.css';

class Track extends Component {
  constructor() {
    super();

    console.log("track constructor called");
    var MIDIroll = new Array(88);

    for (var i = 0; i < MIDIroll.length; i++) {
      MIDIroll[i] = <TrackRow name="THIS IS A TEST"/>;
      // MIDIroll[i] = new Array(120);
      // for(var j = 0; j < MIDIroll[i].length; j++) {
      //   var id = generateID();
      //   MIDIroll[i][j] = <TrackCell name="test"/>;
      // }
    }

    var piano = [];
    for (var i=0; i < 88; i++) {
        piano.push((<div className="piano-key">piano</div>));
    }

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
          <p>{this.props.track.name}</p>
          <a className="close-link" onClick={() => this.props.trackDeleteClicked(this.props.track)}>x</a>
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
