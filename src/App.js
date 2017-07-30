// vim: ts=2 sw=2

import React, { Component } from 'react';
import './App.css';

// MODEL
import RapidWrapper from './RapidWrapper.js';
import { MIDINote, MIDITrack, MIDIDatastore } from './MIDIDatastore.js';
import { generateID } from './Utils.js';

// MATERIAL UI COMPONENTS
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FontIcon from 'material-ui/FontIcon';

// UI COMPONENTS
import Header from './Header.js';
import Track from './Track.js';

// PLAYBACK
import PlaybackEngine from './PlaybackEngine.js';

var ENTER_KEY = 13;

class App extends Component {

  constructor() {
    super();

    this.handleCreateTrack = this.handleCreateTrack.bind(this);
    this.datastoreCallback = this.datastoreCallback.bind(this);

    this.MIDIDatastore = new MIDIDatastore();
    this.MIDIDatastoreClient = this.MIDIDatastore.getClient("MainClient");
    this.MIDIDatastoreClient.registerCallback(this.datastoreCallback);

    this.rapidWrapper   = new RapidWrapper(this.MIDIDatastore);
    this.playbackEngine = new PlaybackEngine(this.MIDIDatastore);

    this.state = {
      midiTracks: {},
      seekpos: {left: '-16rem'}
    };
  }

  handleCreateTrack(event) {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }
    console.log("enter pressed - handleCreateTrack Called");
    event.preventDefault();

    // var trackName = this.state.newTrackName.trim();
    var trackName = event.target.value.trim();
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
    }
  }

  render() {

    var tracksBody;
    var tracks = this.MIDIDatastoreClient.getTracks();

    var trackItems = tracks.reverse().map(track => {
      return (
        <Track
            key={track.id}
            track={track}
            trackDeleteClicked={track => {
                this.MIDIDatastoreClient.removeTrack(track);
                delete this.state.midiTracks[track.id];
                this.setState(this.state);
            }}/>
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

          <Header create={{
            onKeyDown: this.handleCreateTrack
          }} songname="THE DOPEST SONG"/>

          <FontIcon className="material-icons floating-seek-icon">arrow_drop_down</FontIcon>
          <div className="floating-seek-bar"></div>

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
