import React, { Component } from 'react';
import './App.css';

// MATERIAL UI COMPONENTS
import {Toolbar, ToolbarTitle, ToolbarGroup} from 'material-ui/Toolbar';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import Avatar from 'material-ui/Avatar';

class Header extends Component {
  constructor() {
    super();
    this.measure = [];
    for (var i=0; i < 100; i++) {
      if (i%3 == 0 && i != 0) {
        this.measure.push((<div className="measure-cell thick"></div>));
      } else {
        this.measure.push((<div className="measure-cell"></div>));
      }
    }
  }

  render() {
    return (
      <Paper className="header-container" zDepth={3}>
        <Toolbar className="header-toolbar">
          <ToolbarTitle text={this.props.songname} />
          <ToolbarGroup>
            <Avatar className="header-avatar" icon={<FontIcon className="material-icons">person</FontIcon>}/>
            <Avatar className="header-avatar" icon={<FontIcon className="material-icons">person</FontIcon>}/>
            <Avatar className="header-avatar" icon={<FontIcon className="material-icons">person</FontIcon>}/>
          </ToolbarGroup>
        </Toolbar>

        <div className="header-subcontainer">
          <Paper className="header-addtrack" zDepth={2}>
            <TextField
              className="header-addtrack-input"
              placeholder="create new track"
              onKeyDown={this.props.create.onKeyDown}
            />
            </Paper>

          <Paper className="header-trackcontrol" zDepth={2}>
            <FontIcon className="material-icons header-trackcontrol-icon">play_arrow</FontIcon>
            <FontIcon className="material-icons header-trackcontrol-icon">pause</FontIcon>
            <FontIcon className="material-icons header-trackcontrol-icon">skip_previous</FontIcon>

            <div className="header-trackcontrol-seek">
              {/* track seeker here*/}
            </div>
          </Paper>
        </div>

        <div className="header-track-measure">
          {this.measure}
        </div>

      </Paper>
    );
  }
}

export default Header;
