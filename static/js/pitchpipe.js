import { INSTRUMENTS_PRESETS, clamp, midiToFreq, letterToMidi, midiToName, stepSemitone, noteLabel, fullName } from "./shared.js";

const instrumentSelect = document.getElementById("instrument");
const noteSelect = document.getElementById("note");
const octaveSelect = document.getElementById("octave");
const flatBtn = document.getElementById("flat-btn");
const sharpBtn = document.getElementById("sharp-btn");
const a4Input = document.getElementById("a4");
const nowPlaying = document.getElementById("now-playing");
const playBtn = document.getElementById("play-btn");
const chromaticControls = document.getElementById("chromatic-controls");

let instrument = "chromatic";
let midi = 69;
let useFlats = false;
let a4 = 440;
let noteStyle = "letters";
let playing = false;
let preset = INSTRUMENTS_PRESETS[instrument];
let context;
let oscillator;
let startAttempt = 0;
let gain;

for (const key of Object.keys(INSTRUMENTS_PRESETS)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = window.I18N["instrument." + key] ?? ("instrument." + key);
    instrumentSelect.appendChild(option);
}

instrumentSelect.value = instrument;

function populateOctaves() {
    octaveSelect.innerHTML = "";

    const firstOctave = Math.floor(preset.minMidi / 12) - 1;
    const lastOctave = Math.floor(preset.maxMidi / 12) - 1;

    for (let octave = firstOctave; octave <= lastOctave; octave++) {
        const option = document.createElement("option");

        option.value = octave;
        option.textContent = octave;

        octaveSelect.appendChild(option);
    }
}

function populateNotes() {
    noteSelect.innerHTML = "";

    if (instrument !== "chromatic") {
        for (const stringMidi of preset.strings) {
            const option = document.createElement("option");

            option.value = stringMidi;
            option.textContent = fullName(stringMidi, useFlats, noteStyle);

            noteSelect.appendChild(option);
        }
    } else {
        const letters = ["C", "D", "E", "F", "G", "A", "B"];

        for (const letter of letters) {
            const option = document.createElement("option");

            option.value = letter;
            option.textContent = noteLabel(letter, noteStyle);

            noteSelect.appendChild(option);
        }
    }
}

function updateDisplay() {
    nowPlaying.textContent =
        `${fullName(midi, useFlats, noteStyle)} — ${midiToFreq(midi, a4).toFixed(1)} Hz`;
    updateTone();
    if (instrument !== "chromatic") {
        noteSelect.value = String(midi);
    } else {
        const { letter, octave } = midiToName(midi, useFlats);

        noteSelect.value = letter;
        octaveSelect.value = String(octave);
    }

    flatBtn.disabled = midi <= preset.minMidi;
    sharpBtn.disabled = midi >= preset.maxMidi;
}

function updateTone() {
    if (!oscillator) return;
    const target = midiToFreq(midi, a4);
    oscillator.frequency.setTargetAtTime(target, context.currentTime, 0.1);
}

function setMidi(newMidi) {
    midi = clamp(newMidi, preset.minMidi, preset.maxMidi);

    updateDisplay();
}

function applyInstrument() {
    preset = INSTRUMENTS_PRESETS[instrument];

    chromaticControls.hidden = (instrument !== "chromatic");

    if (instrument !== "chromatic") {
        midi = preset.strings[0];
        useFlats = false;
    } else {
        midi = clamp(midi, preset.minMidi, preset.maxMidi);
        populateOctaves();
    }

    populateNotes();
    updateDisplay();
}

applyInstrument();

// Written with help from Claude (Anthropic), per CS50's rules on citing AI.
function stepBy(direction) {
    const stepped = stepSemitone(midi, direction);
    useFlats = stepped.useFlats;   // up = sharps, down = flats
    setMidi(stepped.midi);          // clamps to the preset range, then re-renders
}

sharpBtn.addEventListener("click", () => stepBy(1));

flatBtn.addEventListener("click", () => stepBy(-1));

noteSelect.addEventListener("change", () => {
    if (instrument !== "chromatic") {
        setMidi(Number(noteSelect.value));
    } else {
        const newMidi = letterToMidi(noteSelect.value, Number(octaveSelect.value));
        if (!Number.isFinite(newMidi)) return;
        setMidi(newMidi);
    }
    updateDisplay();
});

octaveSelect.addEventListener("change", () => {
    const newOctave = Number(octaveSelect.value);
    const currentOctave = midiToName(midi, useFlats).octave;

    setMidi(midi + 12 * (newOctave - currentOctave));
});

instrumentSelect.addEventListener("change", () => {
    instrument = instrumentSelect.value;
    applyInstrument();
});

// Written with help from Claude (Anthropic), per CS50's rules on citing AI.
function changeNoteStyle(event) {
    noteStyle = event.target.value;
    populateNotes();
    updateDisplay();
}

for (const radio of document.querySelectorAll('input[name="note-style"]')) {
    radio.addEventListener("change", changeNoteStyle);
}

a4Input.addEventListener("change", () => {
    if (Number.isFinite(Number(a4Input.value))) {
        a4 = clamp(Number(a4Input.value), 415, 466);
        a4Input.value = a4;
        updateDisplay();
    }
});

// Written with help from Claude (Anthropic), per CS50's rules on citing AI. (The gain logic was me.)

function setButtonLabel() {
    const key = playing ? "common.stop" : "common.start";
    playBtn.textContent = window.I18N[key] ?? key;
}

async function startTone() {
    const attempt = ++startAttempt;
    playing = true;
    setButtonLabel();

    try {
        context ??= new AudioContext();

        if (context.state === "suspended") {
            await context.resume();
        }

        if (attempt !== startAttempt) return;

        const osc = context.createOscillator();
        const gainNode = context.createGain();
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
        osc.type = "triangle";
        osc.frequency.value = midiToFreq(midi, a4);
        osc.connect(gainNode).connect(context.destination);
        osc.addEventListener("ended", () => {
            osc.disconnect();
            gainNode.disconnect();
        });
        osc.start();
        oscillator = osc;
        gain = gainNode;
    } catch (error) {
        console.error(error);
        if (attempt === startAttempt) {
            playing = false;
            setButtonLabel();
        }
    }
}

function stopTone() {
    startAttempt++;

    if (oscillator) {
        const oldOsc = oscillator;
        const oldGain = gain;
        oscillator = null;
        gain = null;

        const now = context.currentTime;
        oldGain.gain.cancelScheduledValues(now);
        oldGain.gain.setValueAtTime(oldGain.gain.value, now);
        oldGain.gain.linearRampToValueAtTime(0, now + 0.1);
        oldOsc.stop(now + 0.15);
    }

    playing = false;
    setButtonLabel();
}

playBtn.addEventListener("click", () => {
    if (playing) {
        stopTone();
    } else {
        startTone();
    }
});

