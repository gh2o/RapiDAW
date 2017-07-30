import React, { Component } from 'react';

import { generateID } from './Utils.js';

import './Track.css';

class Track extends Component {
  constructor() {

    var MIDIroll = new Array(88);

    for (var i = 0; i < MIDIroll.length; i++) {
      MIDIroll[i] = new Array(120);
      for(var j = 0; j < MIDIroll[i].length; j++) {
        var id = generateID();
        MIDIroll[i][j] = new MIDINote(id);
      }
    }

    this.setState = {
      MIDIroll: MIDIroll
    }

  }

  render() {
    return (
      <div className="track-container">
      	<div className="track-info">
      		<p>{this.props.name}</p>
      	</div>
        <div className="midi-row">
        </div>
      </div>
    );
  }
}

export default Track;
