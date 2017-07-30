import React, { Component } from 'react';

class TrackRow extends Component {

  render() {
    return (
      <div className="cell-container">
      		<p>{this.props.name}</p>
      </div>
    );
  }
}

export {TrackRow};
