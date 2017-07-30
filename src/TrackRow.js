import React, { Component } from 'react';
import { TrackCell } from './TrackCell.js';
import './Track.css';

class TrackRow extends Component {
  constructor() {
    super();
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.state = {
      pressed: false,
      released: false,
      cells: []
    };
  }

  handleMouseDown(event) {
    console.log("pageX :" + event.pageX);
    console.log("pageY :" + event.pageY);
    this.setState({pressed: !this.state.pressed});
    console.log(this.state.pressed);
  }

  handleMouseUp(event) {
    var rect = this.rowDiv.getBoundingClientRect()
    console.log(rect.top, rect.right, rect.bottom, rect.left);

    this.setState({
      pressed: !this.state.pressed,
      released: !this.state.released,
      position: event.pageX - rect.left
    });

    console.log(this.state.pressed);
  }

  handleDrag(event) {
    console.log(event);
  }

  render() {
    if(!this.state.pressed && this.state.released) {
      this.state.cells.push(
        <TrackCell
          position={this.state.position}/>
      );
    }
    return (
      <div
        className="track-row-container"
        onDrag={this.handleDrag}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        ref={(div) => { this.rowDiv = div; }}
        >
        {this.state.cells}
      </div>
    );
  }
}

export {TrackRow};
