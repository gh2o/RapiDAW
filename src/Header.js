import React, { Component } from 'react';
import './App.css';

// MATERIAL UI COMPONENTS
import {Toolbar, ToolbarTitle} from 'material-ui/Toolbar';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

class Header extends Component {
  render() {
    return (
      <Paper className="header-container" zDepth={3}>
        <Toolbar className="header-toolbar">
          <ToolbarTitle text="SONGNAME" />
        </Toolbar>

        <div className="header-subcontainer">
          {/*<Paper className="header-addtrack" zDepth={2}>
            <TextField className="header-addtrack-input" defaultValue="New Track" />
            <FlatButton icon={<FontIcon className="material-icons header-trackcontrol-icon">add</FontIcon>}/>
          </Paper>*/}

          <Paper className="header-trackcontrol" zDepth={2}>
            <FontIcon className="material-icons header-trackcontrol-icon">play_arrow</FontIcon>
            <FontIcon className="material-icons header-trackcontrol-icon">pause</FontIcon>
            <FontIcon className="material-icons header-trackcontrol-icon">skip_previous</FontIcon>

            <div className="header-trackcontrol-seek">
              {/* track seeker here*/}
            </div>
          </Paper>
        </div>

      </Paper>
    );
  }
}

export default Header;
