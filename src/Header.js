import React, { Component } from 'react';
import './App.css';
import img1 from './img/1.jpg';
import img2 from './img/2.jpg';
import img3 from './img/3.jpg';

// MATERIAL UI COMPONENTS
import {Toolbar, ToolbarTitle, ToolbarGroup} from 'material-ui/Toolbar';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import Avatar from 'material-ui/Avatar';
import Badge from 'material-ui/Badge';

class Header extends Component {
  constructor() {
    super();
    var count = 1;
    this.measure = [];
    for (var i=1; i < 100; i++) {
      if (i%4 === 0 && i !== 0) {
        this.measure.push((<div key={i} className="measure-cell thick">{count}</div>));
      } else {
        this.measure.push((<div key={i} className="measure-cell">{count}</div>));
      }
      count++;
    }
  }

  render() {
    return (
      <Paper className="header-container" zDepth={2}>
        <div className="header-subcontainer">
          <p>{this.props.songname}</p>

          <div className="header-trackcontrol">
            <FontIcon
              className="material-icons header-trackcontrol-icon"
              onClick={this.props.handlePlayPress}>
                play_arrow
            </FontIcon>
            <FontIcon
              className="material-icons header-trackcontrol-icon"
              onClick={this.props.handleStopPress}>
              pause
            </FontIcon>
            <FontIcon
              className="material-icons header-trackcontrol-icon"
              onClick={this.props.handleStopPress}>
              skip_previous
            </FontIcon>
          </div>

          <Badge className="badge online" primary={true}>
            <Avatar className="header-avatar" src={img1} />
          </Badge>
          <Badge className="badge online" primary={true}>
            <Avatar className="header-avatar" src={img2} />
          </Badge>
          <Badge className="badge offline" primary={true}>
            <Avatar className="header-avatar" src={img3} />
          </Badge>
        </div>

        <div className="header-bottombar">
          <TextField
            id="header-addtrack-input"
            className="header-addtrack-input"
            placeholder="create new track"
            onKeyDown={this.props.create.onKeyDown}
          />
          <div
            id="measureBar"
            className="header-track-measure"
            onClick={this.props.handleMeasureBarClick}>
            {this.measure}
          </div>
        </div>

      </Paper>
    );
  }
}

export default Header;
