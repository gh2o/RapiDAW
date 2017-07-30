import React, { Component } from 'react';

import { MIDINote, MIDITrack, MIDIDatastore } from './MIDIDatastore.js';
import { TrackCell } from './TrackCell.js';
import { generateID } from './Utils.js';

import './Track.css';

class Track extends Component {
  constructor() {
    super();

    console.log("track constructor called");
    var MIDIroll = new Array(88);

    for (var i = 0; i < MIDIroll.length; i++) {
      MIDIroll[i] = new Array(120);
      for(var j = 0; j < MIDIroll[i].length; j++) {
        var id = generateID();
        MIDIroll[i][j] = new MIDINote(id,j,1,i);
      }
    }

    this.state = {
      MIDIroll: MIDIroll
    }

  }

  render() {
    var midiBody;

    var cells = this.state.MIDIroll.map(track => {
      return(
        <TrackCell
          name={this.props.name}
        />
      )
    })

    console.log("LENGTH " + cells.length);

    if (cells.length) {
      midiBody = (
        <div className="midi-container">
          {cells}
        </div>
      );
    }

    return (
      <div className="track-container">
      	<div className="track-info">
      		<p>{this.props.track.name}</p>
      	</div>
        {midiBody}
      </div>
    );
  }
}

export default Track;
