import Rapid from 'rapid-io'

var classNames = require('classnames');

class RapidWrapper {
  constructor(datastore) {
    this.datastore = datastore;
    this.client = Rapid.createClient('NDA1OWE0MWo1b3AzYzc0LnJhcGlkLmlv');
    this.client
      .collection('tracks')
      .subscribe((messages, changes) => {
        console.log(messages);
        console.log("SUBSCRIBED");
    });
  }

  //Pass the iobject you want to mutate
  addTrack(newTrackName) {
    console.log("ADDTRACK CALLED");
    this.client
      .collection('tracks')
      .newDocument()
      .mutate({ text: newTrackName })
    console.log("NEW TRACK CREATED");
  }
}

export default RapidWrapper;
