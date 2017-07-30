// vim: ts=2 sw=2

import React, { Component } from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import update from 'immutability-helper';
import './App.css';

// MODEL
import RapidWrapper from './RapidWrapper.js';
import { MIDITrack, MIDIDatastore } from './MIDIDatastore.js';
import { generateID } from './Utils.js';

// MATERIAL UI COMPONENTS
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

// UI COMPONENTS
import Header from './Header.js';
import Track from './Track.js';

// PLAYBACK
import PlaybackEngine from './PlaybackEngine.js';

var ENTER_KEY = 13;
var SPACE_KEY = 32;
var PLAYMARK_KEY = 99;
var OFFSET = 23.5;
var MARKER_KEY = 115;

export const PIXELS_PER_BEAT = 40;

class App extends Component {

  constructor() {
    super();

    document.onkeypress = this.onKeyPress.bind(this);
    injectTapEventPlugin();

    this.muiTheme = getMuiTheme({
      palette: {
        primary1Color: '#8D6E63',
        accent1Color: '#009688'
      }
    });

    this.handleCreateTrack = this.handleCreateTrack.bind(this);
    this.datastoreCallback = this.datastoreCallback.bind(this);
    this.handlePlayPress = this.handlePlayPress.bind(this);
    this.handleStopPress = this.handleStopPress.bind(this);
    this.handleRewindPress = this.handleRewindPress.bind(this);
    this.handleMeasureBarClick = this.handleMeasureBarClick.bind(this);
    this.handleMeasureScroll = this.handleMeasureScroll.bind(this);
    this.updateSeekHeadPeriodic = this.updateSeekHeadPeriodic.bind(this);

    this.MIDIDatastore = new MIDIDatastore();
    this.MIDIDatastoreClient = this.MIDIDatastore.getClient("MainClient");
    this.MIDIDatastoreClient.registerCallback(this.datastoreCallback);

    this.rapidWrapper   = new RapidWrapper(this.MIDIDatastore);
    this.playbackEngine = new PlaybackEngine(this.MIDIDatastore);

    this.state = {
      midiTracks: {},
      playState: "initial",
      notesByTrackId: {},
      marker: false,
      scrollPos: 0,
      seekActive: false,
      seekAtEnd: false,
      loaded: false,
      markerPos: null,
    };
  }

  updateOrRemoveStateTrack(track, remove) {
    if (!this.state.loaded) {
      this.setState({loaded: true});
    }
    if (remove) {
      var unset = {$unset: [track.id]};
      this.setState({
        midiTracks: update(this.state.midiTracks, unset),
        notesByTrackId: update(this.state.notesByTrackId, unset)
      });
    } else {
      this.setState({
        midiTracks: update(this.state.midiTracks, {[track.id]: {$set: track}})
      });
      if (!(track.id in this.state.notesByTrackId)) {
        this.setState({
          notesByTrackId: update(this.state.notesByTrackId, {[track.id]: {$set: {}}})
        });
      }
    }
  }

  handleCreateTrack(event) {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }
    console.log("enter pressed - handleCreateTrack Called");
    event.preventDefault();

    var trackName = event.target.value.trim();
    event.target.value = '';
    var id = generateID();
    var track = new MIDITrack(id,trackName,0,1);

    this.MIDIDatastoreClient.addOrUpdateTrack(track);
    this.updateOrRemoveStateTrack(track, false);
  }

  datastoreCallback(/*String*/ eventName, /*Object*/ eventParams) {
    switch (eventName) {
      case 'trackAddedOrUpdated':
      {
        let {track} = eventParams;
        this.updateOrRemoveStateTrack(track, false);
        break;
      }
      case 'trackRemoved':
      {
        let {track} = eventParams;
        this.updateOrRemoveStateTrack(track, true);
        break;
      }
      case 'notesRefreshed':
      {
        let {track, notes} = eventParams;
        let notesObj = {};
        for (let note of notes) {
          notesObj[note.id] = note;
        }
        this.setState({
          notesByTrackId: update(this.state.notesByTrackId,
            {[track.id]: {$set: notesObj}})
        });
        break;
      }
      default:
        console.log('unknown event', eventName);
        break;
    }
  }

  onKeyPress(evt) {
    if ([SPACE_KEY, MARKER_KEY, PLAYMARK_KEY].indexOf(evt.keyCode) < 0) {
      return;
    }
    console.log("enter pressed - onKeyPress Called");
    evt.preventDefault();
    switch (evt.keyCode) {
      case SPACE_KEY:
        if (!this.state.seekActive) {
          this.handlePlayPress();
        } else {
          this.handleStopPress();
        }
        break;
      case MARKER_KEY:
        this.setState({markerPos: this.playbackEngine.currentPosition()});
        break;
      case PLAYMARK_KEY:
        if (this.state.markerPos !== null) {
          this.instantBarSeek(this.state.markerPos);
        }
        break;
    }
  }

  //initial
  //play
  //stop
  //finish
  handlePlayPress() {
    console.log("handlePlayPress - playstate: " + this.state.playState);
    if (!this.state.seekActive) {
      if (this.state.seekAtEnd) {
        this.playbackEngine.seek(0);
      }
      this.playbackEngine.play();
      this.setState({seekActive: true, seekAtEnd: false});
      window.requestAnimationFrame(this.updateSeekHeadPeriodic);
    }
  }

  handleStopPress() {
    console.log("handleStopPress Start - playState:" + this.state.playState);
    if (this.state.seekActive) {
      this.playbackEngine.stop(false);
      this.setState({
        seekActive: false,
      });
    } else {
      this.playbackEngine.seek(0);
    }
    this.updateSeekHeadPosition();
  }

  handleRewindPress() {
    if (this.state.seekActive) {
      this.playbackEngine.stop(true);
      this.playbackEngine.seek(0);
      this.handleStopPress();
      setTimeout(() => this.handlePlayPress(), 0);
    } else {
      this.handleStopPress();
    }
  }

  updateSeekHeadPosition() {
    let measBarBox = this.getMeasureBarBox();
    let seekHeadDiv = document.getElementById(this.seekHeadElem.props.id);
    let {seekBarDiv} = this;
    let currPlayPos = this.playbackEngine.currentPosition();
    let epx = currPlayPos * PIXELS_PER_BEAT - this.state.scrollPos;
    let desc;
    if (epx >= 0) {
      let px = measBarBox.left + epx;
      seekHeadDiv.style.display = 'block';
      seekHeadDiv.style.left = (px - OFFSET) + 'px';
      seekBarDiv.style.display = 'block';
      seekBarDiv.style.left = px + 'px';
      desc = (epx >= measBarBox.width) ? 'right' : 'in';
    } else {
      // seek head is off to the left of the screen, hide it
      seekHeadDiv.style.display = 'none';
      seekBarDiv.style.display = 'none';
      desc = 'left';
    }
    return {desc, epx}; // epx is offset from left of measure bar
  }

  updateSeekHeadPeriodic() {
    if (!this.state.seekActive) {
      return;
    }

    var {desc, epx} = this.updateSeekHeadPosition();
    if (desc === 'right') {
      this.setState({scrollPos: epx - 50});
    }

    if (this.playbackEngine.isPlaying()) {
      window.requestAnimationFrame(this.updateSeekHeadPeriodic);
    } else {
      this.setState({
        seekActive: false,
        seekAtEnd: true
      }, () => this.handlePlayPress());
    }
  }

  getMeasureBarBox() {
    if (!this.measureBar) {
      this.measureBar = document.getElementById("measureBar");
    }
    return this.measureBar.getBoundingClientRect();
  }

  instantBarSeek(beats) {
    if (this.state.seekActive) {
      this.playbackEngine.stop(true);
      this.playbackEngine.seek(beats);
      this.playbackEngine.play();
      this.updateSeekHeadPosition();
    } else {
      this.playbackEngine.seek(beats);
      this.updateSeekHeadPosition();
    }
  }

  handleMeasureBarClick(event) {
    console.log("handleMeasureBarClick", event.pageX);
    let px = event.pageX - this.getMeasureBarBox().left + this.state.scrollPos;
    let beats = px / PIXELS_PER_BEAT;
    this.instantBarSeek(beats);
  }

  handleMeasureScroll(pos) {
    this.setState({scrollPos: pos}, () => this.updateSeekHeadPosition());
  }

  render() {

    var tracks = this.MIDIDatastoreClient.getTracks();
    var trackItems = tracks.reverse().map(track => {
      return (
        <Track
            key={track.id}
            track={track}
            notes={this.state.notesByTrackId[track.id] || {}}
            scrollPos={this.state.scrollPos}
            trackDeleteClicked={track => {
              this.MIDIDatastoreClient.removeTrack(track);
              this.updateOrRemoveStateTrack(track, true);
            }}
            noteAddedOrUpdatedCallback={(track, note) => {
              this.MIDIDatastoreClient.addOrUpdateNote(track, note);
              this.setState({
                notesByTrackId: update(this.state.notesByTrackId,
                  {[track.id]: {[note.id]: {$set: note}}})
              });
            }}
            noteDeletedCallback={(track, note) => {
              this.MIDIDatastoreClient.removeNote(track, note);
              this.setState({
                notesByTrackId: update(this.state.notesByTrackId,
                  {[track.id]: {$unset: [note.id]}})
              });
            }}
            trackInstrumentUpdated={(track,instrument) => {
              track.instrument = instrument;
              this.MIDIDatastoreClient.addOrUpdateTrack(track);
              this.updateOrRemoveStateTrack(track, false);
            }}
            trackVolumeUpdated={(track,volume) => {
              track.volume = volume;
              this.MIDIDatastoreClient.addOrUpdateTrack(track);
              this.updateOrRemoveStateTrack(track, false);
            }}
        />
      );
    });

    var marker;

    if (this.state.markerPos !== null) {
      var epx = this.state.markerPos * PIXELS_PER_BEAT - this.state.scrollPos;
      if (epx >= 0) {
        var px = this.getMeasureBarBox().left + epx;
        marker = (
          <FontIcon
            id="markerhead"
            className="material-icons floating-seek-icon"
            style={{
              left:(px-OFFSET)+"px",
              position: 'fixed',
              transition: 'none'
            }}>
            arrow_drop_down
          </FontIcon>
        );
      }
    }

    return (
      <MuiThemeProvider muiTheme={this.muiTheme}>
        <div className="App">

          <Header
          create={{ onKeyDown: this.handleCreateTrack }}
          songname="THE DOPEST SONG"
          scrollPos={this.state.scrollPos}
          handlePlayPress={this.handlePlayPress}
          handleStopPress={this.handleStopPress}
          handleRewindPress={this.handleRewindPress}
          handleMeasureBarClick={this.handleMeasureBarClick}
          handleMeasureScroll={this.handleMeasureScroll}/>

          {marker}

          <FontIcon
            ref={elem => { this.seekHeadElem = elem; }}
            id="seekhead"
            className="material-icons floating-seek-icon"
            style={{position: 'fixed', transition: 'none'}}>
            arrow_drop_down
          </FontIcon>

          <div
            ref={div => { this.seekBarDiv = div; }}
            id="seekbar"
            className="floating-seek-bar"
            style={{pointerEvents: 'none'}}>
          </div>

          <div className="body-padding"></div>

          <div className="body-container">
            {trackItems}
          </div>

        </div>
      </MuiThemeProvider>
    );
  }
}
/*ref={(div) => { this.seekdiv = div; }}*/

export default App;
