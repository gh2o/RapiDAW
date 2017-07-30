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
    console.log("ONKEYPRESS");
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
    this.handleMeasureBarClick = this.handleMeasureBarClick.bind(this);

    this.MIDIDatastore = new MIDIDatastore();
    this.MIDIDatastoreClient = this.MIDIDatastore.getClient("MainClient");
    this.MIDIDatastoreClient.registerCallback(this.datastoreCallback);

    this.rapidWrapper   = new RapidWrapper(this.MIDIDatastore);
    this.playbackEngine = new PlaybackEngine(this.MIDIDatastore);

    this.state = {
      midiTracks: {},
      playState: "initial",
      notesByTrackId: {},
      marker: false
    };
  }

  updateOrRemoveStateTrack(track, remove) {
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

  getOriginalPosition() {
    if(this.origBarPos == null) {
      this.seekhead = document.getElementById("seekhead");
      this.seekbar = document.getElementById("seekbar");
      this.origBarPos = this.seekbar.getBoundingClientRect().left;
      this.origHeadPos = this.seekhead.getBoundingClientRect().left;
    }
  }

  onKeyPress(e) {
    e = e || window.event;
    if (!(e.keyCode !== SPACE_KEY || e.keyCode !== MARKER_KEY && e.keyCode !== PLAYMARK_KEY)) {
      return;
    }
    console.log("enter pressed - onKeyPress Called");
    e.preventDefault();
    this.getMeasureBar();
    this.getOriginalPosition();
    if(e.keyCode === SPACE_KEY) {
      if(this.state.playState === "play") {
        this.playbackEngine.stop(false);
        window.requestAnimationFrame(this.updateSeekHead.bind(this));
        this.state.playState = "paused";
      } else if(this.state.playState === "paused" || this.state.playState === "initial") {
        this.playbackEngine.play();
        window.requestAnimationFrame(this.updateSeekHead.bind(this));
        this.state.playState = "play";
      }
    } else if(e.keyCode === MARKER_KEY) {
      console.log("MARK IT");
      this.markedposition = this.seekbar.getBoundingClientRect().left - OFFSET;
      this.setState({marker:true});
    } else if(e.keyCode === PLAYMARK_KEY && this.state.marker) {
      console.log("MARK PLAYMARK");
      //this.seekbar.getBoundingClientRect().left;
      this.seekbar.style.left = this.markedposition + 'px';
      this.seekhead.style.left = this.markedposition - OFFSET + 'px';
      this.playbackEngine.seek(this.getMeasureBarOffsetForEventX(this.seekbar.getBoundingClientRect().left)/PIXELS_PER_BEAT);
      this.playbackEngine.play();
      window.requestAnimationFrame(this.updateSeekHead.bind(this));
      this.state.playState = "play";
    }
  }

  //initial
  //play
  //stop
  //finish
  handlePlayPress() {
    console.log("handlePlayPress - playstate: " + this.state.playState);
    if(this.state.playState === "initial") {
      this.getOriginalPosition()
      this.position = 0.0;
    } else if(this.state.playState === "finish") {
      this.seekbar.style.left = this.origBarPos+'px';
      this.seekhead.style.left = this.origHeadPos+'px';
      this.playbackEngine.seek(0.0);
    }
    this.playbackEngine.play();
    this.setState({playState: "play"})
    window.requestAnimationFrame(this.updateSeekHead.bind(this));
  }

  handleStopPress() {
    console.log("handleStopPress Start - playState:" + this.state.playState);
    if(this.state.playState === "initial") {
      this.getOriginalPosition()
    } else if(this.state.playState === "play") {
      this.playbackEngine.stop(false);
      this.position = this.playbackEngine.currentPosition();
      this.setState({playState: "paused"});
    } else if(this.state.playState === "paused") {
      this.seekbar.style.left = this.origBarPos+'px';
      this.seekhead.style.left = this.origHeadPos+'px';
      this.playbackEngine.stop(true);
      this.playbackEngine.seek(0);
      this.setState({playState: "initial"});
    }
    console.log("handleStopPress End - playState:" + this.state.playState);
  }

  updateSeekHead() {
    var currPlayPos = this.playbackEngine.currentPosition();

    this.seekbar.style.left = (this.origBarPos+currPlayPos*PIXELS_PER_BEAT)+'px';
    this.seekhead.style.left = (this.origHeadPos+currPlayPos*PIXELS_PER_BEAT)+'px';

    if(this.playbackEngine.isPlaying()) {
      window.requestAnimationFrame(this.updateSeekHead.bind(this));
    } else if(this.state.playState === "play") {
      this.playbackEngine.seek(0);
    }
  }

  getMeasureBarOffsetForEventX(x) {
    var rect = this.measureBar.getBoundingClientRect();
    return x - rect.left;
  }

  getMeasureBar() {
    if(this.measureBar == null) {
      this.measureBar = document.getElementById("measureBar");
    }
  }

  handleMeasureBarClick(event) {
    console.log("handleMeasureBarClick", event.pageX);
    this.getMeasureBar();
    this.getOriginalPosition();
    this.seekbar.style.left = event.pageX + 'px';
    this.seekhead.style.left =  event.pageX - OFFSET + 'px';
    this.playbackEngine.seek(this.getMeasureBarOffsetForEventX(event.pageX)/PIXELS_PER_BEAT);
  }

  getOffsetForEventX(x) {
    var rect = this.seekdiv.getBoundingClientRect();
    return x - rect.left;
  }

  getStyle() {
    return {
      left:this.markedposition+"px",
      position: 'fixed',
      transition: 'none'
    };
  }

  render() {

    var tracks = this.MIDIDatastoreClient.getTracks();
    var trackItems = tracks.reverse().map(track => {
      return (
        <Track
            key={track.id}
            track={track}
            notes={this.state.notesByTrackId[track.id] || {}}
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

    if(this.state.marker) {
      console.log("MARKER IS TRUE");
      marker = (
        <FontIcon
          id="markerhead"
          className="material-icons floating-seek-icon"
          style={this.getStyle()}>
          arrow_drop_down
        </FontIcon>
      );
    }

    return (
      <MuiThemeProvider muiTheme={this.muiTheme}>
        <div className="App">

          <Header
          create={{ onKeyDown: this.handleCreateTrack }}
          songname="THE DOPEST SONG"
          handlePlayPress={this.handlePlayPress}
          handleStopPress={this.handleStopPress}
          handleMeasureBarClick={this.handleMeasureBarClick}/>

          {marker}

          <FontIcon
            id="seekhead"
            className="material-icons floating-seek-icon"
            style={{position: 'fixed', transition: 'none'}}>
            arrow_drop_down
          </FontIcon>

          <div
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
