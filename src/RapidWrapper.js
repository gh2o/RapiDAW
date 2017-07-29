import Rapid from 'rapid-io'

var classNames = require('classnames');
//MIDIDatastore datastore
class RapidWrapper {
  constructor() {
    // this.datastore = datastore;
    this.client = Rapid.createClient('NDA1OWE0MWo1b3AzYzc0LnJhcGlkLmlv');
    this.client
      .collection('tracks')
      .subscribe((messages, changes) => {
        console.log(messages);
      // changes.added.forEach(message => {
      //   $('#trackbox').append($('<div>').text(message.body.text))
      // })
    });
  }

  //Pass the iobject you want to mutate
  addTrack() {
    this.client
      .collection('tracks')
      .newDocument()
      // .mutate({ text: $('#input').val() })
  }
}

export default RapidWrapper;
