import React, { Component } from 'react';

class TrackRow extends Component {

  render() {
    return (
      <div className="track-row-container">
      		<p>{this.props.name}</p>
      </div>
    );
  }
}

export {TrackRow};
