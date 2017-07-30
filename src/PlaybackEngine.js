import Tone from 'tone';

function beatsToToneTime(beats) {
    if (beats < 0 || isNaN(beats) || beats > 1e10) {
        throw new Error("bad beats");
    }
    return `0:${beats}:0`;
}

function pitchNumToFrequency(num) {
    return 440 * Math.pow(2, (num - 69) / 12);
}

class PlaybackEngine {
    constructor(/*MIDIDatastore*/ datastore) {
        this.datastoreCallback = this.datastoreCallback.bind(this);
        this.transportCallback = this.transportCallback.bind(this);

        this.ds_client = datastore.getClient('PlaybackEngine');
        this.ds_client.registerCallback(this.datastoreCallback);
        this.transport_evt = null;
        this.note_timeline = null;

        this.instr_by_track_id = {};

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
                let ticks = note.beat * ppq;
                if (ticks >= Tone.Transport.ticks) {
                    this.note_timeline.add({
                        time: ticks,
                        duration: note.duration * ppq,
                        track,
                        note});
                }
            }
        }

        /*
        let track = [
            new MIDITrack('k', 'blah'),
        ];
        let notes = [
            new MIDINote('1', 0, 1, 69),
            new MIDINote('2', 1, 1, 71),
            new MIDINote('3', 2, 1, 73),
            new MIDINote('4', 3, 1, 74),
            new MIDINote('5', 4, 1, 76),
            new MIDINote('6', 5, 1, 78),
            new MIDINote('7', 6, 1, 80),
            new MIDINote('8', 7, 1, 81),
        ];
        for (let note of notes) {
            let ticks = note.beat * ppq;
            console.log('cmp', ticks, Tone.Transport.ticks);
            if (ticks >= Tone.Transport.ticks) {
                this.note_timeline.add({
                    time: ticks,
                    duration: note.duration * ppq,
                    track,
                    note});
            }
        }
        */

        // start the transport
        Tone.Transport.start();

        // schedule note transport
        this.transport_evt = true; // force start
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
                this.stop(false);
                return;
            }
            if (item.time > cur_ticks) {
                break;
            }
            this.instr_by_track_id[item.track.id]
                .triggerAttackRelease(
                    pitchNumToFrequency(item.note.pitch),
                    new Tone.Time(item.duration, "i").toSeconds(),
                    real_time);
            this.note_timeline.shift();
        }

        this.transport_evt = Tone.Transport.scheduleOnce(
            t => this.transportCallback(t, item.time),
            new Tone.Time(item.time, "i"));
    }

    datastoreCallback(/*String*/ eventName, /*Object*/ eventParams) {
        switch (eventName) {
            case 'trackAddedOrUpdated':
            {
                let {track} = eventParams;
                this.instr_by_track_id[track.id] = this.createInstrumentForTrack(track);
                break;
            }
            case 'trackRemoved':
            {
                let {track} = eventParams;
                delete this.instr_by_track_id[track.id];
                break;
            }
            default:
            {
                break;
            }
        }
    }

    /*Tone*/ createInstrumentForTrack(/*MIDITrack*/ track) {
        switch (track.instrument) {
            case "lead1":
            default:
                return new Tone.PolySynth(6, Tone.Synth).toMaster();
        }
    }
}

window.Tone = Tone;

export default PlaybackEngine;
