import randomstring from 'randomstring';

function generateID() {
    return randomstring.generate(12);
}

function pitchToName(num) {
    var octave   = Math.floor(num / 12);
    var semitone = Math.floor(num % 12);
    return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][semitone] + octave;
}

export { generateID, pitchToName };
