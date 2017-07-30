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
import ContentAdd from 'material-ui/svg-icons/content/add';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FontIcon from 'material-ui/FontIcon';

// UI COMPONENTS
import Header from './Header.js';
import TrackHead from './TrackHead.js';
import Track from './Track.js';

// PLAYBACK
import PlaybackEngine from './PlaybackEngine.js';

var ENTER_KEY = 13;
export const PIXELS_PER_BEAT = 40;

class App extends Component {

  constructor() {
    super();
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


    this.MIDIDatastore = new MIDIDatastore();
    this.MIDIDatastoreClient = this.MIDIDatastore.getClient("MainClient");
    this.MIDIDatastoreClient.registerCallback(this.datastoreCallback);

    this.rapidWrapper   = new RapidWrapper(this.MIDIDatastore);
    this.playbackEngine = new PlaybackEngine(this.MIDIDatastore);

    this.state = {
      midiTracks: {},
      playState: "initial",
      notesByTrackId: {}
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
    var track = new MIDITrack(id,trackName,0);

    this.MIDIDatastoreClient.addOrUpdateTrack(track);
    this.updateOrRemoveStateTrack(track, false);
  }

  datastoreCallback(/*String*/ eventName, /*Object*/ eventParams) {
    console.log(eventName);
    switch (eventName) {
      case 'trackAddedOrUpdated':
      {
        console.log("TRACK ADDED");
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

  handlePlayPress() {
    console.log("handlePlayPress");
    if(this.state.playState === "initial") {
      this.seekhead = document.getElementById("seekhead");
      this.seekbar = document.getElementById("seekbar");
      this.origBarPos = this.seekbar.getBoundingClientRect().left;
      this.origHeadPos = this.seekhead.getBoundingClientRect().left;
    } else if(this.state.playState === "finish") {
      this.seekbar.style.left = this.origBarPos+'px';
      this.seekhead.style.left = this.origHeadPos+'px';
      this.playbackEngine.seek(0.0);
    }
    this.setState({playState: "play"})
    this.playbackEngine.play();
    window.requestAnimationFrame(this.updateSeekHead.bind(this));
  }

  handleStopPress() {
    console.log("handleStopPress");
    if(this.state.playState === "play") {
      this.setState({playState: "paused"});
      this.playbackEngine.stop(false);
    } else {
      this.seekbar.style.left = this.origBarPos+'px';
      this.seekhead.style.left = this.origHeadPos+'px';
      this.playbackEngine.stop(true);
      this.setState({playState: "initial"});
    }
  }

  updateSeekHead() {
    var currPlayPos = this.playbackEngine.currentPosition();

    console.log("updateSeekHead before", currPlayPos);

    this.seekbar.style.left = (this.origBarPos+currPlayPos*PIXELS_PER_BEAT)+'px';
    this.seekhead.style.left = (this.origHeadPos+currPlayPos*PIXELS_PER_BEAT)+'px';

    console.log("updateSeekHead after", currPlayPos);

    if(this.playbackEngine.isPlaying()) {
      window.requestAnimationFrame(this.updateSeekHead.bind(this));
    } else {
      this.playbackEngine.stop(true);
      this.setState({playState: "finish"});
    }
  }

  getOffsetForEventX(x) {
    var rect = this.seekdiv.getBoundingClientRect();
    return x - rect.left;
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
        />
      );
    });

    return (
      <MuiThemeProvider muiTheme={this.muiTheme}>
        <div className="App">

          <Header
          create={{ onKeyDown: this.handleCreateTrack }}
          songname="THE DOPEST SONG"
          handlePlayPress={this.handlePlayPress}
          handleStopPress={this.handleStopPress}/>

          <FontIcon
            id="seekhead"
            className="material-icons floating-seek-icon">
            arrow_drop_down
          </FontIcon>

          <div
            id="seekbar"
            className="floating-seek-bar">
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
