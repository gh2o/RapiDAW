// vim: ts=2 sw=2

import React, { Component } from 'react';

import { TrackRow } from './TrackRow.js';

// MATERIAL UI
import FontIcon from 'material-ui/FontIcon';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Slider from 'material-ui/Slider';  

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
      resizedNote: null,
      resizedCell: null,
    }
  }

  handleChange = (event, index, instrument) => this.setState({instrument});


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
        noteDeleted={note => this.props.noteDeletedCallback(this.props.track, note)}
        noteDragStarted={note => {
          this.props.noteDeletedCallback(this.props.track, note);
          this.setState({mouseActive: true});
        }}
        noteResizeStarted={(note, cell) => {
          this.setState({
            resizedNote: note,
            resizedCell: cell
          });
        }}/>);
    }

    return (
      <div className="track-container"
           onContextMenu={evt => evt.preventDefault()}
           onMouseDown={evt => evt.button !== 2 && this.setState({mouseActive: true})}
           onMouseUp={() => this.setState({mouseActive: false, resizedNote: null, resizedCell: null})}
           onMouseLeave={() => this.setState({mouseActive: false, resizedNote: null, resizedCell: null})}
           onMouseMove={evt => {
             if (this.state.resizedNote) {
               this.state.resizedCell.resizeUpdate(evt, this.pianoConDiv.getBoundingClientRect());
             }
           }}>

        <div className="track-info">
          <FontIcon className="material-icons close-link"  onClick={() => this.props.trackDeleteClicked(this.props.track)}>close</FontIcon>
          <br />
          <p>{this.props.track.name}</p>
          <DropDownMenu value={this.state.instrument} onChange={this.handleChange}>
            <MenuItem value={1} primaryText="Instrument" />
            <MenuItem value={2} primaryText="Instrument2" />
            <MenuItem value={3} primaryText="Instrument3" />
            <MenuItem value={4} primaryText="Instrument4" />
            <MenuItem value={5} primaryText="Instrument5" />
          </DropDownMenu>
          <Slider defaultValue={1} className="track-info-slider"/>
        </div>

        <div className="pianoroll-container">
          <div className="piano">
            {this.pianoElements}
          </div>
          <div className="piano-container" ref={div => { this.pianoConDiv = div; }}>
            {trackRows}
          </div>
        </div>
    </div>
    );
  }
}

export default Track;
