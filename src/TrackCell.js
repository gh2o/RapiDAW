import React, { Component } from 'react';

class TrackCell extends Component {

  render() {
    return (
      <div className="track-cell-container">
      		<p>{this.props.name}</p>
      </div>
    );
  }
}

export {TrackCell};
