import React, { Component } from 'react';
import './Track.css';

class Track extends Component {
  render() {
    return (
      <div className="midi-container">
      		<p>{this.props.name}</p>
      </div>
    );
  }
}

export default Track;
