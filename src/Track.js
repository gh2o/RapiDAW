// vim: ts=2 sw=2

import React, { Component } from 'react';
import FadeIn from 'react-fade-in';

import { TrackRow } from './TrackRow.js';
import { pitchToName } from './Utils.js';

// MATERIAL UI
import FontIcon from 'material-ui/FontIcon';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Slider from 'material-ui/Slider';  

import './Track.css';

export const PIANO_MIDI_OFFSET = 9; // typical piano starts at MIDI note 9 for A0
export const PIANO_NUM_KEYS = 88;

class Track extends Component {
  constructor() {
    super();

    console.log("track constructor called");

    this.finishDragOrResize = this.finishDragOrResize.bind(this);

    this.pianoElements = [];
    for (var i = 0; i < PIANO_NUM_KEYS; i++) {
        var pitch = i + PIANO_MIDI_OFFSET;
        var name = pitchToName(pitch);
        this.pianoElements.push(<div className={"piano-key " + (name[1] === '#' ? "black" : "white")} key={i}>{name}</div>);
    }
    this.pianoElements.reverse();

    this.state = {
      mouseActive: false,
      moveDuration: null,
      resizedNote: null,
      resizedCell: null,
      resizeDuration: null, // persistent
    }
  }

  handleInstrumentChange = (event, index, instrument) => {
      this.props.trackInstrumentUpdated(this.props.track, instrument);
  }
  handleVolumeChange = (event, volume) => {
      this.props.trackVolumeUpdated(this.props.track, volume);
  }

  finishDragOrResize() {
    if (this.state.resizedNote) {
      let new_duration = this.state.resizedCell.getResizeDuration();
      this.state.resizedCell.resizeFinish();
      let res_note = this.state.resizedNote;
      res_note.duration = new_duration;
      this.props.noteAddedOrUpdatedCallback(this.props.track, res_note);
      this.setState({resizeDuration: new_duration});
    }
    this.setState({
      mouseActive: false,
      moveDuration: null,
      resizedNote: null,
      resizedCell: null
    });
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
    for (var i = 0; i < PIANO_NUM_KEYS; i++) {
      let pitch = PIANO_MIDI_OFFSET + 87 - i;
      trackRows.push(<TrackRow
        key={pitch}
        pitch={pitch}
        notes={notesByPitch[pitch] || []}
        mouseActive={this.state.mouseActive}
        moveDuration={this.state.moveDuration !== null ? this.state.moveDuration : this.state.resizeDuration}
        noteAdded={note => this.props.noteAddedOrUpdatedCallback(this.props.track, note)}
        noteDeleted={note => this.props.noteDeletedCallback(this.props.track, note)}
        noteDragStarted={note => {
          this.props.noteDeletedCallback(this.props.track, note);
          this.setState({mouseActive: true, moveDuration: note.duration});
        }}
        noteResizeStarted={(note, cell) => {
          this.setState({
            resizedNote: note,
            resizedCell: cell
          });
        }}/>);
    }

    return (
      <FadeIn>
      <div className="track-container"
           onContextMenu={evt => evt.preventDefault()}
           onMouseDown={evt => evt.button !== 2 && this.setState({mouseActive: true})}
           onMouseUp={this.finishDragOrResize}
           onMouseLeave={this.finishDragOrResize}
           onMouseMove={evt => {
             if (this.state.resizedNote) {
               this.state.resizedCell.resizeUpdate(evt, this.pianoConDiv.getBoundingClientRect());
             }
           }}>

        <div className="track-info">
          <FontIcon
            className="material-icons close-link"
            style={{cursor: 'pointer'}}
            onClick={() => this.props.trackDeleteClicked(this.props.track)}>
              close
          </FontIcon>
          <br />
          <p>{this.props.track.name}</p>
          <DropDownMenu 
            value={this.props.track.instrument} 
            onChange={this.handleInstrumentChange}
            iconStyle={{fill: '#8D6E63'}}
            underlineStyle={{display: 'none'}}
          >
            <MenuItem value="lead1" primaryText="Lead 1" />
            <MenuItem value="lead2" primaryText="Lead 2" />
            <MenuItem value="lead3" primaryText="Lead 3" />
            <MenuItem value="bass1" primaryText="Bass 1" />
            <MenuItem value="bass2" primaryText="Bass 2" />
            <MenuItem value="bass3" primaryText="Bass 3" />
            <MenuItem value="kick" primaryText="Kick" />
            <MenuItem value="snare" primaryText="Snare" />
            <MenuItem value="hihat" primaryText="Hi-Hat" />
          </DropDownMenu>
          <Slider value={this.props.track.volume} className="track-info-slider" onChange={this.handleVolumeChange}/>
        </div>

        <div className="pianoroll-container">
          <div className="piano" ref={div => { this.pianoKeysDiv = div; }}>
            {this.pianoElements}
          </div>
          <div className="piano-container"
              ref={div => { this.pianoConDiv = div; }}
              onScroll={evt => { this.pianoKeysDiv.scrollTop = evt.target.scrollTop; }}>
            <div className="piano-sub">
              {trackRows}
            </div>
          </div>
        </div>
    </div>
    </FadeIn>
    );
  }

  componentDidUpdate() {
    if (this.pianoConDiv.scrollLeft !== this.props.scrollPos) {
      this.pianoConDiv.scrollLeft = this.props.scrollPos;
    }
  }
}

export default Track;
