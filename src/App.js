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

    this.MIDIDatastore = new MIDIDatastore();
    this.MIDIDatastoreClient = this.MIDIDatastore.getClient("MainClient");
    this.MIDIDatastoreClient.registerCallback(this.datastoreCallback);

    this.rapidWrapper   = new RapidWrapper(this.MIDIDatastore);
    this.playbackEngine = new PlaybackEngine(this.MIDIDatastore);

    this.state = {
      midiTracks: {},
      notesByTrackId: {},
      seekpos: {left: '-16rem'}
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
      <MuiThemeProvider muiTheme={this.muiTheme}>
        <div className="App">

          <Header create={{
            onKeyDown: this.handleCreateTrack
          }} songname="THE DOPEST SONG"/>

          <FontIcon className="material-icons floating-seek-icon">arrow_drop_down</FontIcon>
          <div className="floating-seek-bar"></div>

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

export default App;
