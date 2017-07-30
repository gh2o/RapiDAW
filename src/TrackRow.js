// vim: ts=2 sw=2

import React, { Component } from 'react';
import { TrackCell } from './TrackCell.js';
import './Track.css';

class TrackRow extends Component {
  constructor() {
    super();
    this.handleMouseDownOrMove = this.handleMouseDownOrMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.state = {
      notes: [],
      mouseX: 0,
      mouseY: 0,
      mouseIn: false
    };
  }

  getOffsetForEventX(x) {
    var rect = this.rowDiv.getBoundingClientRect();
    return x - rect.left;
  }

  handleMouseDownOrMove(evt) {
    console.log("pageX :" + evt.pageX);
    console.log("pageY :" + evt.pageY);
    this.setState({
      mouseX: evt.pageX,
      mouseY: evt.pageY,
      mouseIn: true
    });
  }

  handleMouseUp(evt) {
    var offsetPx = this.getOffsetForEventX(evt.pageX);
    console.log('add note', offsetPx);

    /*
    console.log(rect.top, rect.right, rect.bottom, rect.left);

    this.setState({
      pressed: !this.state.pressed,
      released: !this.state.released,
      position: event.pageX - rect.left
    });

    console.log(this.state.pressed);
    */
  }

  render() {
    if(!this.state.pressed && this.state.released) {
      this.state.cells.push(
        <TrackCell
          position={this.state.position}/>
      );
    }
    var cells = [];
    for (let note in this.state.notes) {
      //....
    }
    if (this.state.mouseIn && this.props.mouseActive) {
      cells.push(<TrackCell position={this.getOffsetForEventX(this.state.mouseX)}/>);
    }
    return (
      <div
        className="track-row-container"
        onMouseDown={this.handleMouseDownOrMove}
        onMouseMove={this.handleMouseDownOrMove}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={() => {this.setState({mouseIn: false})}}
        ref={(div) => { this.rowDiv = div; }}>
        {cells}
      </div>
    );
  }
}

export {TrackRow};
