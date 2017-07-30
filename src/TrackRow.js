import React, { Component } from 'react';

import './Track.css';

class TrackRow extends Component {

  render() {
  	var piano = [];
  	for (var i=0; i < 88; i++) {
  		piano.push((<div className="piano-key">a</div>));
  	}
    return (
      <div className="track-row-container">
      		{this.props.name}
      </div>
    );
  }
}

export {TrackRow};
