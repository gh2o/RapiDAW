// vim: ts=2 sw=2

import React, { Component } from 'react';
import './App.css';

// MODEL
import RapidWrapper from './RapidWrapper.js';
import { MIDINote, MIDITrack, MIDIDatastore } from './MIDIDatastore.js';
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
      barseekpos: {left: '16rem'}
    };
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
    this.state.midiTracks[track.id] = track;
    this.setState();
  }

  datastoreCallback(/*String*/ eventName, /*Object*/ eventParams) {
    console.log(eventName);
    switch (eventName) {
      case 'trackAddedOrUpdated':
      {
        console.log("TRACK ADDED");
        let {track} = eventParams;
        this.state.midiTracks[track.id] = track;
        this.setState(this.state);
        break;
      }
      case 'trackRemoved':
      {
        let {track} = eventParams;
        delete this.state.midiTracks[track.id];
        this.setState(this.state);
        break;
      }
      case 'notesRefreshed':
      {
        this.setState(this.state);
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
    console.log("updateSeekHead");
    var currPos = this.seekdiv.getBoundingClientRect.left;
    var currPlayPos = this.playbackEngine.currentPosition();
    this.state.position = currPos + currPlayPos;
    if(this.playbackEngine.isPlaying()) {
      window.requestAnimationFrame(this.updateSeekHead.bind(this));
    }
  }

  getStyle() {
      return {
        left:(this.state.position)+"px"
      };
  }

  getOffsetForEventX(x) {
    var rect = this.seekdiv.getBoundingClientRect();
    return x - rect.left;
  }

  render() {

    var tracksBody;
    var tracks = this.MIDIDatastoreClient.getTracks();

    var trackItems = tracks.reverse().map(track => {
      return (
        <Track
            key={track.id}
            datastoreClient={this.MIDIDatastoreClient}
            track={track}
            notes={this.MIDIDatastoreClient.getNotes(track) || []}
            trackDeleteClicked={track => {
                this.MIDIDatastoreClient.removeTrack(track);
                delete this.state.midiTracks[track.id];
                this.setState(this.state);
            }}
            noteAddedCallback={() => this.setState(this.state)}/>
      );
    });

    if (tracks.length) {
      tracksBody = (
        <div className="body-container">
          {trackItems}
        </div>
      );
    }

    return (
      <MuiThemeProvider>
        <div className="App">

          <Header
          create={{ onKeyDown: this.handleCreateTrack }}
          songname="THE DOPEST SONG"
          handlePlayPress={this.handlePlayPress}/>

          <FontIcon
            className="material-icons floating-seek-icon"
            ref={(div) => { this.seekhead = div; }}
            style={this.getStyle()}>
            arrow_drop_down
            </FontIcon>
          <div
            className="floating-seek-bar"
            style={this.getStyle()}
            ref={(div) => { this.seekdiv = div; }}>
          </div>

          <div className="body-padding"></div>

          {tracksBody}

          {/*<FloatingActionButton className="button-addtrack">
            <ContentAdd />
          </FloatingActionButton>*/}

        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
