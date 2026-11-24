export const INSTRUMENTS_PRESETS = {
    chromatic: {
        strings: [], minMidi: 21, maxMidi: 108
        
     },
    guitar:    { strings: [40, 45, 50, 55, 59, 64], minMidi: 36, maxMidi: 76  },
    bass:      { strings: [28, 33, 38, 43],         minMidi: 24, maxMidi: 55  },
    violin:    { strings: [55, 62, 69, 76],         minMidi: 51, maxMidi: 88  },
    viola:     { strings: [48, 55, 62, 69],         minMidi: 44, maxMidi: 81  },
    cello:     { strings: [36, 43, 50, 57],         minMidi: 32, maxMidi: 69  },
    ukulele:   { strings: [67, 60, 64, 69],         minMidi: 56, maxMidi: 81  },
};

export function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

export function midiToFreq(midi, a4=440) {
    return a4 * Math.pow(2, (midi - 69) / 12);
}

// Written with help from Claude (Anthropic), per CS50's rules on citing AI.
export function letterToMidi(letter, octave) {
    const noteMap = {
        C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
    };
    const noteIndex = noteMap[letter];
    if (noteIndex === undefined) return NaN;
    return Number((octave + 1) * 12 + noteIndex);
}

export function midiToName(midi, useFlats=false) {
    const noteSharp = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const noteFlat  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
    const noteNames = useFlats ? noteFlat : noteSharp;
    const note = noteNames[midi % 12];
    const letter = note[0];
    const accidental = note.slice(1);
    const octave = Math.floor(midi / 12) - 1;
    return { letter, accidental, octave };
}

export function stepSemitone(midi, direction) {
    return { midi: midi + direction, useFlats: direction < 0 };
}

export function noteLabel(letter, noteStyle) {
    return (noteStyle === "solfege") ? window.I18N["solfege." + letter] : letter;
}

export function fullName(midi, useFlats, noteStyle) {
    const { letter, accidental, octave } = midiToName(midi, useFlats);
    return noteLabel(letter, noteStyle) + accidental + octave;
}