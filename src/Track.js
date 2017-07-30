import React, { Component, PureComponent } from 'react';

import { MIDINote, MIDITrack, MIDIDatastore } from './MIDIDatastore.js';
import { TrackRow } from './TrackRow.js';
import { generateID } from './Utils.js';

import './Track.css';

class Track extends PureComponent {
  constructor() {
    super();
    console.log("track constructor called");

    var TrackRows = new Array(88);

    for (var i = 0; i < TrackRows.length; i++) {
      TrackRows[i] = <TrackRow/>;
    }

    var piano = [];
    for (var i=0; i < 88; i++) {
        piano.push((<div className="piano-key">piano</div>));
    }

    this.state = {
      piano: piano,
      trackRows: TrackRows
    }
  }

  render() {
    var midiBody;
    if (this.state.trackRows.length) {
      midiBody = (
        <div className="piano-container">
          {this.state.trackRows}
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
