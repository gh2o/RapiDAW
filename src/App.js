import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

// MATERIAL UI COMPONENTS
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

// UI COMPONENTS
import Header from './Header.js';
import Track from './Track.js';

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <div className="App">

          <Header />

          <div className="body-container">
            <Track />
            <Track />
            <Track />
            <Track />
          </div>

          <FloatingActionButton className="button-addtrack">
            <ContentAdd />
          </FloatingActionButton>

          {/*
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Welcome to React</h2>
          </div>

          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          */}

        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
