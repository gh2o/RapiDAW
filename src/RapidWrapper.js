import Rapid from 'rapid-io';
import { MIDINote, MIDITrack } from './MIDIDatastore.js';
import { generateID } from './Utils.js';

const NOTE_KEY_PREFIX = 'nt$';
const NOTE_KEY_PFXLEN = NOTE_KEY_PREFIX.length;

function getMIDITrackFromDoc(doc) {
    let track  = new MIDITrack();
    track.id   = doc.id;
    track.name = doc.body.name;
    track.instrument = doc.body.instrument;
    return track;
}

function getMIDINotesFromDoc(doc) {
    let result = [];
    for (let key in doc.body) {
        let val = doc.body[key];
        if (!key.startsWith(NOTE_KEY_PREFIX)) continue;
        if (!val) continue;
        let note = new MIDINote();
        note.id       = key.substring(NOTE_KEY_PFXLEN);
        note.beat     = val.beat;
        note.duration = val.duration;
        note.pitch    = val.pitch;
        result.push(note);
    }
    return result;
}

function getObjFromMIDINote(note) {
    return {
        beat:     note.beat,
        duration: note.duration,
        pitch:    note.pitch,
    };
}

class RapidWrapper {
    constructor(/*MIDIDatastore*/ datastore, /*String*/ proj_id) {
        this.proj_id = proj_id = 'BEST_PROJECT_ID_EVER' // TODO

        this.rp_user = generateID();
        this.rp_client = Rapid.createClient('NDA1OWE0MWo1b3AzYzc0LnJhcGlkLmlv');

        this.rp_collections = {
            projects: this.rp_client.collection('projects'),
            tracks:   this.rp_client.collection('tracks').filter({proj_id}),
        };

        this.rp_proj = this.rp_collections.projects.document(proj_id);
        this.rp_proj.subscribe(this.rpProjValueCallback.bind(this),
                               this.rpProjErrorCallback.bind(this));

        this.rp_track_revs = {};
        this.rp_collections.tracks
            .subscribe(this.rpTrackValueCallback.bind(this),
                       this.rpTrackErrorCallback.bind(this));

        this.ds_client = datastore.getClient('RapidWrapper');
        this.ds_client.registerCallback(this.dsCallback.bind(this));
    }

    /*void*/ dsCallback(/*String*/ eventName, /*Object*/ eventParams) {
        switch (eventName) {
            case 'trackAddedOrUpdated':
            {
                let {track} = eventParams;
                let doc = this.rp_collections.tracks.document(track.id);
                doc.execute(doc => {
                    let data = doc ? doc.body : {};
                    data.name = track.name;
                    data.instrument = track.instrument;
                    data.proj_id = this.proj_id;
                    this.updateTrackRev(data, track);
                    return data;
                });
                break;
            }
            case 'trackRemoved':
            {
                let {track} = eventParams;
                let doc = this.rp_collections.tracks.document(track.id);
                doc.delete();
                break;
            }
            case 'noteAddedOrUpdated':
            {
                let {track, note} = eventParams;
                let doc = this.rp_collections.tracks.document(track.id);
                doc.execute(doc => {
                    let data = doc ? doc.body : {};
                    data[NOTE_KEY_PREFIX + note.id] = getObjFromMIDINote(note);
                    this.updateTrackRev(data, track);
                    return data;
                });
                break;
            }
            case 'noteRemoved':
            {
                let {track, note} = eventParams;
                let doc = this.rp_collections.tracks.document(track.id);
                doc.execute(doc => {
                    let data = doc ? doc.body : {};
                    delete data[NOTE_KEY_PREFIX + note.id];
                    this.updateTrackRev(data, track);
                    return data;
                });
                break;
            }
            default:
                console.log("RapidWrapper: unknown event " + eventName);
                break;
        }
    }

    /*void*/ updateTrackRev(/*Object*/ data, /*MIDITrack*/ track) {
        let new_rev = (data.rev || 0) + 1;
        this.rp_track_revs[track.id] = new_rev;
        data.rev = new_rev;
    }

    /*void*/ rpProjValueCallback(doc) {
        console.log('rpProjValueCallback', doc);
    }

    /*void*/ rpProjErrorCallback(/*Object*/ error) {
        console.log('rpProjErrorCallback', error);
    }

    /*void*/ rpTrackValueCallback(tracks, {added, updated, removed}) {
        for (let doc of added.concat(updated)) {
            let track = getMIDITrackFromDoc(doc);
            if ((doc.body.rev || 0) > (this.rp_track_revs[track.id] || -1)) {
                this.ds_client.addOrUpdateTrack(track);
                this.ds_client.refreshNotes(track, getMIDINotesFromDoc(doc));
                this.rp_track_revs[track.id] = doc.body.rev || 0;
            }
        }
        for (let doc of removed) {
            let track = getMIDITrackFromDoc(doc);
            this.ds_client.removeTrack(track);
        }
    }

    /*void*/ rpTrackErrorCallback(/*Object*/ error) {
        console.log('rpTrackErrorCallback', error);
    }
}

export default RapidWrapper;
