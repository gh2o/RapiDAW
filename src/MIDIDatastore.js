class MIDINote {
    constructor(/*string*/ id, /*float*/ beat, /*float*/ duration, /*int*/ pitch) {
        Object.assign(this, {id, beat, duration, pitch});
    }
}

class MIDITrack {
    constructor(/*string*/ id, /*string*/ name, /*string*/ instrument) {
        Object.assign(this, {id, name, instrument});
    }
}

class MIDIDatastore {
    constructor() {
        this.tracksByTrackId = {};
        this.notesByTrackId = {};
        this.callbacks = [];
    }

    /*MIDIDatastoreClient*/ getClient(name) {
        return new MIDIDatastoreClient(this, name);
    }

    /*void*/ fireEvent(/*String*/ client, /*String*/ eventName, /*Object*/ eventParams) {
        console.log("fireEvent");
        let clientName = client.name;
        for (let cbName in this.callbacks) {
            if (cbName !== clientName) {
                let cb = this.callbacks[cbName];
                cb && cb(eventName, eventParams);
            }
        }
    }
}

class MIDIDatastoreClient {
    constructor(/*MIDIDatastore*/ datastore, /*String*/ name) {
        this.datastore = datastore;
        this.name = name;
    }

    /*MIDINote[]*/ getNotes(/*MIDITrack*/ track) {
        return Object.values(this.datastore.notesByTrackId[track.id]);
    }

    /*MIDITrack[]*/ getTracks() {
        return Object.values(this.datastore.tracksByTrackId);
    }

    /*void*/ addOrUpdateNote(/*MIDITrack*/ track, /*MIDINote*/ note) {
        this.datastore.notesByTrackId[track.id][note.id] = note;
        this.datastore.fireEvent(this, 'noteAddedOrUpdated', {track, note});
    }

    /*void*/ removeNote(/*MIDITrack*/ track, /*MIDINote*/ note) {
        delete this.datastore.notesByTrackId[track.id][note.id];
        this.datastore.fireEvent(this, 'noteRemoved', {track, note});
    }

    /*void*/ refreshNotes(/*MIDITrack*/ track, /*MIDINote[]*/ notes) {
        let newNotes = {};
        for (let note of notes) {
            newNotes[note.id] = note;
        }
        this.datastore.notesByTrackId[track.id] = newNotes;
        this.datastore.fireEvent(this, 'notesRefreshed', {track, notes: Object.values(newNotes)});
    }

    /*void*/ addOrUpdateTrack(/*MIDITrack*/ track) {
        console.log("addOrUpdateTrack called!");
        this.datastore.tracksByTrackId[track.id] = track;
        if (!(track.id in this.datastore.notesByTrackId)) {
            this.datastore.notesByTrackId[track.id] = {};
        }
        this.datastore.fireEvent(this, 'trackAddedOrUpdated', {track});
    }

    /*void*/ removeTrack(/*MIDITrack*/ track) {
        delete this.datastore.tracksByTrackId[track.id];
        delete this.datastore.notesByTrackId[track.id];
        this.datastore.fireEvent(this, 'trackRemoved', {track});
    }

    /*void*/ registerCallback(/*function*/ cb) {
        this.datastore.callbacks[this.name] = cb;
    }
}

export { MIDINote, MIDITrack, MIDIDatastore };
