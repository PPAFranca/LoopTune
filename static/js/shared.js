export const INSTRUMENTS_PRESETS = {
    chromatic: {
        strings: [], min_midi: 21, max_midi: 108
        
     },
    guitar:    { strings: [40, 45, 50, 55, 59, 64], min_midi: 36, max_midi: 76  },
    bass:      { strings: [28, 33, 38, 43],         min_midi: 24, max_midi: 55  },
    violin:    { strings: [55, 62, 69, 76],         min_midi: 51, max_midi: 88  },
    viola:     { strings: [48, 55, 62, 69],         min_midi: 44, max_midi: 81  },
    cello:     { strings: [36, 43, 50, 57],         min_midi: 32, max_midi: 69  },
    ukulele:   { strings: [67, 60, 64, 69],         min_midi: 56, max_midi: 81  },
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
    if (noteIndex === undefined) return null;
    return (octave + 1) * 12 + noteIndex;
}

export function midiToName(midi, use_flats=false) {
    const noteSharp = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const noteFlat  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
    const noteNames = use_flats ? noteFlat : noteSharp;
    const note = noteNames[midi % 12];
    const letter = note[0];
    const accidental = note.slice(1);
    const octave = Math.floor(midi / 12) - 1;
    return { letter, accidental, octave };
}

export function stepSemitone(midi, direction) {
    return { midi: midi + direction, use_flats: direction < 0 };
}