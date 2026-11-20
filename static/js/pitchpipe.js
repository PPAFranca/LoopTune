import { INSTRUMENTS_PRESETS, clamp, midiToFreq, letterToMidi, midiToName, stepSemitone} from "./shared.js";

const instrument_select = document.getElementById("instrument");
const note_select = document.getElementById("note");
const octave_select = document.getElementById("octave");
const flat_btn = document.getElementById("flat-btn");
const sharp_btn = document.getElementById("sharp-btn");
const a4_input = document.getElementById("a4");
const now_playing = document.getElementById("now-playing");
const play_btn = document.getElementById("play-btn");
const chromatic_controls = document.getElementById("chromatic-controls");

let instrument = 'chromatic';
let midi = 69;
let use_flats = false;
let a4 = 440;
let note_style = 'solfege';
let playing = false;
let preset = INSTRUMENTS_PRESETS[instrument]; 

for (const key of Object.keys(INSTRUMENTS_PRESETS)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = window.I18N["instrument." + key] ?? ("instrument." + key);
    instrument_select.appendChild(option);
}

instrument_select.value = instrument;


function noteLabel(letter) {
    return (note_style === 'solfege') ? window.I18N["solfege." + letter] : letter;
} 


function fullName(midi) {
    const { letter, accidental, octave } = midiToName(midi, use_flats);
    return noteLabel(letter) + accidental + octave;
}

function populateOctaves() {
    octave_select.innerHTML = "";

    const firstOctave = Math.floor(preset.min_midi / 12) - 1;
    const lastOctave = Math.floor(preset.max_midi / 12) - 1;

    for (let octave = firstOctave; octave <= lastOctave; octave++) {
        const option = document.createElement("option");

        option.value = octave;
        option.textContent = octave;

        octave_select.appendChild(option);
    }
}


function populateNotes() {
    note_select.innerHTML = "";

    if (instrument !== "chromatic") {
        for (const string_midi of preset.strings) {
            const option = document.createElement("option");

            option.value = string_midi;
            option.textContent = fullName(string_midi);

            note_select.appendChild(option);
        }
    } else {
        const letters = ["C", "D", "E", "F", "G", "A", "B"];

        for (const letter of letters) {
            const option = document.createElement("option");

            option.value = letter;
            option.textContent = noteLabel(letter);

            note_select.appendChild(option);
        }
    }
}

function updateDisplay() {
    now_playing.textContent =
        `${fullName(midi)} — ${midiToFreq(midi, a4).toFixed(1)} Hz`;

    if (instrument !== "chromatic") {
        note_select.value = String(midi);
    } else {
        const { letter, octave } = midiToName(midi, use_flats);

        note_select.value = letter;
        octave_select.value = String(octave);
    }

    flat_btn.disabled = midi <= preset.min_midi;
    sharp_btn.disabled = midi >= preset.max_midi;
}

function setMidi(newMidi) {
    midi = clamp(newMidi, preset.min_midi, preset.max_midi);

    updateDisplay();

}

function applyInstrument() {
    preset = INSTRUMENTS_PRESETS[instrument];

    chromatic_controls.hidden = (instrument !== "chromatic");

    if (instrument !== "chromatic") {
        midi = preset.strings[0];
        use_flats = false;
    } else {
        midi = clamp(midi, preset.min_midi, preset.max_midi);
        populateOctaves();
    }

    populateNotes();
    updateDisplay();
}

applyInstrument()

// Written with help from Claude (Anthropic), per CS50's rules on citing AI.
function stepBy(direction) {
    const stepped = stepSemitone(midi, direction);
    use_flats = stepped.use_flats;   // up = sharps, down = flats
    setMidi(stepped.midi);          // clamps to the preset range, then re-renders
}

sharp_btn.addEventListener("click", () => stepBy(1));

flat_btn.addEventListener("click", () => stepBy(-1));


note_select.addEventListener("change", () => {

    if (instrument !== "chromatic") {
        setMidi(Number(note_select.value));
    } else {
        setMidi(Number(letterToMidi(note_select.value, Number(octave_select.value))));
    }
    updateDisplay();
});


octave_select.addEventListener("change", () => {

    const new_octave = Number(octave_select.value);
    const current_octave = midiToName(midi, use_flats).octave;

    setMidi(midi + 12 * (Number(new_octave) - Number(current_octave)));

    updateDisplay();
});


instrument_select.addEventListener("change", () => {
    instrument = instrument_select.value;
    applyInstrument();
});


// Written with help from Claude (Anthropic), per CS50's rules on citing AI.
function changeNoteStyle(event) {
    note_style = event.target.value;   
    populateNotes();                   
    updateDisplay();                   
}

for (const radio of document.querySelectorAll('input[name="note-style"]')) {
    radio.addEventListener("change", changeNoteStyle);
}

