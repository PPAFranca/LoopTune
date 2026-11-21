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
let note_style = 'letters';
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

a4_input.addEventListener("change", () => {
    if (Number.isFinite(Number(a4_input.value))) {
        a4 = clamp(Number(a4_input.value), 415, 466);
        a4_input.value = a4;
        updateDisplay();
    }
});


// Written with help from Claude (Anthropic), per CS50's rules on citing AI.
let context;
let oscillator;
let start_attempt = 0;

// Before: play_btn.textContent = window.I18N["common.start"]; (repeated in 3 places, no fallback)
function set_button_label() {
    const key = playing ? "common.stop" : "common.start";
    play_btn.textContent = window.I18N[key] ?? key;
}

async function start_tone() {
    // Before: (no attempt counter)
    const attempt = ++start_attempt;
    playing = true;
    // Before: the label only changed to Stop after oscillator.start()
    set_button_label();

    // Before: let started = false;   (removed along with the finally block)
    try {
        context ??= new AudioContext();

        if (context.state === "suspended") {
            await context.resume();
        }

        // Before: if (!playing) return;
        if (attempt !== start_attempt) return;

        // Before: oscillator = context.createOscillator(); oscillator.type = ...; etc.
        // (all four lines used the module-level variable directly)
        const osc = context.createOscillator();
        const gain_node = context.createGain()
        gain_node.gain.setValueAtTime(0, context.currentTime);
        gain_node.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.03);
        osc.type = "sine";
        osc.frequency.value = midiToFreq(midi, a4);
        osc.connect(gain_node).connect(context.destination);
        osc.addEventListener("ended", () => {osc.disconnect(), gain_node.disconnect()});
        osc.start();
        oscillator = osc;

    // Before: } finally { if (!started) { playing = false; play_btn.textContent = ...; } }
    } catch (error) {
        console.error(error);
        if (attempt === start_attempt) {
            playing = false;
            set_button_label();
        }
    }
}

function stop_tone() {
    // Before: (no counter, so a Stop during the await could not cancel a pending start)
    start_attempt++;

    if (oscillator) {
        oscillator.stop();
        // Before: oscillator.disconnect();   (now done by the ended listener)
        oscillator = null;
    }

    // Before: playing = false; play_btn.textContent = window.I18N["common.start"];
    playing = false;
    set_button_label();
}

play_btn.addEventListener("click", () => {
    if (playing) {
        stop_tone();
    } else {
        start_tone();
    }
});