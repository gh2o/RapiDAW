import Tone from 'tone';

class PlaybackEngine {
    constructor(/*MIDIDatastore*/ datastore) {
        this.ds_client = datastore.getClient('PlaybackEngine');
        this.ds_client.registerCallback(this.datastoreCallback.bind(this));
    }

    play() {
        Tone.Transport.start();
    }

    stop() {
        Tone.Transport.stop();
    }

    seek(/*float*/ beats /* from beginning */) {
        if (beats < 0 || isNaN(beats) || beats > 1e10) {
            throw new Error("bad beats");
        }
        Tone.Transport.position = `0:${beats}:0`;
    }

    datastoreCallback(/*String*/ eventName, /*Object*/ eventParams) {
        switch (eventName) {
            case 'trackAddedOrUpdated':
            {
            }
            case 'trackRemoved':
            {
            }
        }
    }
}

window.Tone = Tone;

export default PlaybackEngine;
