import Tone from 'tone';

function beatsToToneTime(beats) {
    if (beats < 0 || isNaN(beats) || beats > 1e10) {
        throw new Error("bad beats");
    }
    return `0:${beats}:0`;
}

class PlaybackEngine {
    constructor(/*MIDIDatastore*/ datastore) {
        this.datastoreCallback = this.datastoreCallback.bind(this);
        this.transportCallback = this.transportCallback.bind(this);

        this.ds_client = datastore.getClient('PlaybackEngine');
        this.ds_client.registerCallback(this.datastoreCallback);
        this.transport_evt = null;
        this.note_timeline = null;

        window.peng = this;
    }

    play() {
        if (this.isPlaying()) {
            return;
        }

        // add all known notes into BST
        let ppq = Tone.Transport.PPQ;
        this.note_timeline = new Tone.Timeline();
        for (let track of this.ds_client.getTracks()) {
            for (let note of this.ds_client.getNotes(track)) {
                let ticks = note.beats * ppq;
                if (ticks >= Tone.Transport.ticks) {
                    this.note_timeline.add({time: ticks, track, note});
                }
            }
        }

        // start the transport
        Tone.Transport.start();

        // schedule note transport
        this.transportCallback(void 0, Tone.Transport.ticks);
    }

    stop(/*bool*/ restart) {
        if (!this.isPlaying()) {
            return;
        }

        // stop the transport
        if (restart) {
            Tone.Transport.stop();
        } else {
            Tone.Transport.pause();
        }

        // deschedule note transport
        if (this.transport_evt !== null) {
            Tone.Transport.clear(this.transport_evt);
            this.transport_evt = null;
        }

        // clear note BST
        this.note_timeline = null;
    }

    seek(/*float*/ beats /* from beginning */) {
        Tone.Transport.position = beatsToToneTime(beats);
    }

    isPlaying() {
        return (Tone.Transport.state === 'started');
    }

    currentPosition() {
        return Tone.Transport.ticks / Tone.Transport.PPQ;
    }

    transportCallback(real_time, cur_ticks) {
        if (this.transport_evt === null) {
            return;
        } else {
            this.transport_evt = null;
        }

        let item;
        while (true) {
            item = this.note_timeline.peek();
            if (!item) {
                return;
            }
            if (item.time > cur_ticks) {
                break;
            }
            console.log('play note', item.note);
            this.note_timeline.shift();
        }

        this.transport_evt = Tone.Transport.scheduleOnce(t => this.transportCallback(t, item.time), item.time);
    }

    datastoreCallback(/*String*/ eventName, /*Object*/ eventParams) {
        switch (eventName) {
            case 'trackAddedOrUpdated':
            {
                break;
            }
            case 'trackRemoved':
            {
                break;
            }
        }
    }
}

window.Tone = Tone;

export default PlaybackEngine;
