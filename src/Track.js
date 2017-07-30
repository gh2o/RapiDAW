// vim: sw=2 ts=2

import React, { Component } from 'react';
import './Track.css';

class Track extends Component {
  render() {
    return (
      <div className="track-container">
        <div className="track-info">
<<<<<<< HEAD
            <p>{this.props.track.name}</p>
            
        </div>
=======
          <p>{this.props.track.name}</p>
          <p><a onClick={() => this.props.trackDeleteClicked(this.props.track)}>DELETE</a></p>
      	</div>
>>>>>>> b03b9c71c92201d4385a1bf7cd66facb669b6803
      </div>
    );
  }
}

export default Track;
