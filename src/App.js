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
    this.handleChange = this.handleChange.bind(this);
    this.datastoreCallback = this.datastoreCallback.bind(this);

    this.MIDIDatastore = new MIDIDatastore();
    this.MIDIDatastoreClient = this.MIDIDatastore.getClient("MainClient");
    this.MIDIDatastoreClient.registerCallback(this.datastoreCallback);

    this.rapidWrapper   = new RapidWrapper(this.MIDIDatastore);
    this.playbackEngine = new PlaybackEngine(this.MIDIDatastore);

    this.state = {
      newTrackName: "",
      midiTracks: {}
    };
  }

  handleChange(event) {
    console.log(this.state);
    this.setState({newTrackName: event.target.value});
  }

  handleCreateTrack(event) {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }
    console.log("enter pressed - handleCreateTrack Called");
    event.preventDefault();

    var trackName = this.state.newTrackName.trim();
    var id = generateID();
    var newTrack = new MIDITrack(id,trackName);

    this.MIDIDatastoreClient.addOrUpdateTrack(newTrack);
    this.setState({newTrackName: ""});
  }

  datastoreCallback(/*String*/ eventName, /*Object*/ eventParams) {
    switch (eventName) {
      case 'trackAddedOrUpdated':
      {
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

    var trackItems = tracks.map(track => {
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
            value: this.state.newTrackName,
            onKeyDown: this.handleCreateTrack,
            onChange: this.handleChange
          }}/>

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
