import randomstring from 'randomstring';

function generateID() {
    return randomstring.generate(12);
}

export { generateID };
