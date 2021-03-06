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
import IconButton from 'material-ui/IconButton';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import Slider from 'material-ui/Slider';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

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

    this.state = {
      editNameDialogOpen: false
    }
  }

  handleOpen = () => {
    this.setState({editNameDialogOpen: true});
  }

  handleClose = () => {
    this.setState({editNameDialogOpen: false});
  }

  componentDidUpdate() {
    let div = this.mbarSubDiv;
    let maxScroll = div.scrollWidth - div.clientWidth;
    if (div.scrollLeft !== this.props.scrollPos && !(this.props.scrollPos >= maxScroll && div.scrollLeft === maxScroll)) {
      div.scrollLeft = Math.min(this.props.scrollPos, maxScroll);
    }
  }

  render() {

    return (
      <Paper className="header-container" zDepth={2}>
        <div className="header-subcontainer">
          <p>{this.props.songname} <FontIcon className="material-icons header-edit-icon" onClick={this.handleOpen}>mode_edit</FontIcon></p>
          <Dialog className="header-edit-dialog" title="Edit Song Name" modal={false} open={this.state.editNameDialogOpen} onRequestClose={this.handleClose}>
            <TextField
              id="header-editname-input"
              className="header-editname-input"
              defaultValue={this.props.songname}
            />
            <br />
            <FlatButton
              label="Cancel"
              primary={true}
              onTouchTap={this.handleClose}
            />
            <FlatButton
              label="Submit"
              primary={true}
              keyboardFocused={true}
              onTouchTap={this.handleClose}
            />
          </Dialog>

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
              onClick={this.props.handleRewindPress}>
              skip_previous
            </FontIcon>
            <FontIcon
              className="material-icons header-trackcontrol-icon"
              onClick={this.props.handleLoopPress}>
              loop
            </FontIcon>
          </div>

          <IconButton className="tooltip-icon-button" tooltip="Leo" touch={true} tooltipPosition="bottom-right">
          <Badge className="badge online" primary={true}>
            <Avatar className="header-avatar" src={img1} />
          </Badge>
          </IconButton>
          <IconButton className="tooltip-icon-button" tooltip="Arlen" touch={true} tooltipPosition="bottom-right">
          <Badge className="badge online" primary={true}>
            <Avatar className="header-avatar" src={img2} />
          </Badge>
          </IconButton>
          <IconButton className="tooltip-icon-button" tooltip="Gavin" touch={true} tooltipPosition="bottom-right">
          <Badge className="badge offline" primary={true}>
            <Avatar className="header-avatar" src={img3} />
          </Badge>
          </IconButton>

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
            <div id="measureBarSub"
                onScroll={evt => this.props.handleMeasureScroll(evt.target.scrollLeft)}
                ref={div => { this.mbarSubDiv = div; }}>
              {this.measure}
            </div>
          </div>
        </div>

      </Paper>
    );
  }
}

export default Header;
