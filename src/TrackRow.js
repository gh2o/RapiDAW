import React, { Component } from 'react';
import { TrackCell } from './TrackCell.js';

import './Track.css';

class TrackRow extends Component {

  constructor() {
    super();
    var cells = new Array(120);
    for(var i = 0; i < cells.length; i++) {
      cells[i] = <TrackCell/>;
    }
    this.state = {
      trackcells: cells
    }
  }

  render() {
    console.log("LENGTH: " + this.state.trackcells.length);
    return (
      <div className="track-row-container">
      	{/*this.state.trackcells*/}
      </div>
    );
  }
}

export {TrackRow};
