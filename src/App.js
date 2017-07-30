// vim: ts=2 sw=2

import React, { Component } from 'react';
import update from 'immutability-helper';
import './App.css';

// MODEL
import RapidWrapper from './RapidWrapper.js';
import { MIDITrack, MIDIDatastore } from './MIDIDatastore.js';
import { generateID } from './Utils.js';

// MATERIAL UI COMPONENTS
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ContentAdd from 'material-ui/svg-icons/content/add';
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

    this.handleCreateTrack = this.handleCreateTrack.bind(this);
    this.datastoreCallback = this.datastoreCallback.bind(this);
    this.handlePlayPress = this.handlePlayPress.bind(this);

    this.MIDIDatastore = new MIDIDatastore();
    this.MIDIDatastoreClient = this.MIDIDatastore.getClient("MainClient");
    this.MIDIDatastoreClient.registerCallback(this.datastoreCallback);

    this.rapidWrapper   = new RapidWrapper(this.MIDIDatastore);
    this.playbackEngine = new PlaybackEngine(this.MIDIDatastore);

    this.state = {
      midiTracks: {},
      position: 250,
      iconorigpos: {left: '14.5rem'},
      iconseekpos: {left: '14.5rem'},
      barorigpos: {left: '16rem'},
      barseekpos: {left: '16rem'},
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
    var track = new MIDITrack(id,trackName);

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
        this.setState({
          notesByTrackId: update(this.state.notesByTrackId, {[track.id]: {$set: notes}})
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
    this.playbackEngine.play();
    window.requestAnimationFrame(this.updateSeekHead.bind(this));
  }

  updateSeekHead() {
    var seekhead = document.getElementById("seekhead");
    var seekbar = document.getElementById("seekbar");
    var currPos = seekhead.getBoundingClientRect().left;
    var currPlayPos = this.playbackEngine.currentPosition();

    console.log("updateSeekHead before", currPos, currPlayPos);

    seekbar.style.left = (currPos+currPlayPos)+'px';
    seekhead.style.left = (currPos+currPlayPos)+'px';

    var currPos = seekhead.getBoundingClientRect().left;
    console.log("updateSeekHead after", currPos, currPlayPos);

    if(this.playbackEngine.isPlaying()) {
      window.requestAnimationFrame(this.updateSeekHead.bind(this));
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
            notes={this.MIDIDatastoreClient.getNotes(track) || []}
            trackDeleteClicked={track => {
                this.MIDIDatastoreClient.removeTrack(track);
                this.updateOrRemoveStateTrack(track, true);
            }}
            noteAddedCallback={(track, note) => {
              this.MIDIDatastoreClient.addOrUpdateNote(track, note);
              this.setState({
                notesByTrackId: update(this.state.notesByTrackId, {[track.id]: {$push: [note]}})
              });
            }}/>
      );
    });

    return (
      <MuiThemeProvider>
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

          {/*<FloatingActionButton className="button-addtrack">
            <ContentAdd />
          </FloatingActionButton>*/}

        </div>
      </MuiThemeProvider>
    );
  }
}
/*ref={(div) => { this.seekdiv = div; }}*/

export default App;
