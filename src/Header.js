import React, { Component } from 'react';
import './App.css';

// MATERIAL UI COMPONENTS
import {Toolbar, ToolbarTitle} from 'material-ui/Toolbar';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';

class Header extends Component {
  render() {
    return (
      <div>
        <Paper className="header-container" zDepth={3}>
          <Toolbar className="header-toolbar">
            <ToolbarTitle text="SONGNAME" />
          </Toolbar>
          
          <Paper className="header-trackcontrol" zDepth={2}>
            <FontIcon className="material-icons header-trackcontrol-icon">play_arrow</FontIcon>
            <FontIcon className="material-icons header-trackcontrol-icon">pause</FontIcon>
            <FontIcon className="material-icons header-trackcontrol-icon">skip_previous</FontIcon>

            <div className="header-trackcontrol-seek">
              {/* track seeker here*/}
            </div>
          </Paper>

        </Paper>
      </div>
    );
  }
}

export default Header;
