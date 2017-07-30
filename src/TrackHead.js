import React, { Component, PureComponent } from 'react';

import { MIDINote, MIDITrack, MIDIDatastore } from './MIDIDatastore.js';
import { TrackRow } from './TrackRow.js';
import { generateID } from './Utils.js';

import FontIcon from 'material-ui/FontIcon';
import './App.css';

const PIXELS_PER_BEAT = 40;

class TrackHead extends Component {

  render() {
    return (
      <div>
      </div>
    );
  }

}

export default TrackHead;
