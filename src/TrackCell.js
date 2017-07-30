import React, { Component } from 'react';

class TrackCell extends Component {

  render() {
    return (
      <div className="cell-container">
      		<p>{this.props.name}</p>
      </div>
    );
  }
}

export {TrackCell};
