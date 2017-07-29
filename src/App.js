import React, { Component } from 'react';
import RapidWrapper from './RapidWrapper.js';
import Track from './Track.js';
import logo from './logo.svg';
import './App.css';
import { MIDIDatastore } from './MIDIDatastore.js';

var ENTER_KEY = 13;

class App extends Component {

  constructor() {
    super();

    this.MIDIDatastore = new MIDIDatastore();
    this.MIDIDatastoreClient = this.MIDIDatastore.getClient("MainClient");

    this.rapidWrapper = new RapidWrapper(this.MIDIDatastore);

    this.handleCreateTrack = this.handleCreateTrack.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      newTrackName: ""
    };
  }

  handleChange(event) {
    console.log(this.state);
    this.setState({newTrackName: event.target.value})
  }

  handleCreateTrack(event) {

    if (event.keyCode !== ENTER_KEY) {
      return;
    }
    event.preventDefault();
    var trackName = this.state.newTrackName.trim();
    var newTrack = new MIDITrack(id,trackName);
    this.MIDIDatastoreClient.addOrUpdateTrack(this.state.newTrackName);
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>RapidDAW</h2>
        </div>
        <div id="trackbox">
          <Track/>
        </div>
        <input id="input"
               placeholder="Create Track"
               value={this.state.newTrackName}
               onKeyDown={this.handleCreateTrack}
               onChange={this.handleChange}
               autoFocus={true}
        />

        <p className="footer">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
