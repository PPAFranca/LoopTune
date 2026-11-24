# LoopTune: TODO

Last updated: 2026-11-23, from the files as they were that day. The pitch pipe tone (Start/Stop with fade) works in Zen and Helium.

## Open decisions

- [ ] Looper mixdown: in the browser (OfflineAudioContext, no new dependency) or on the server (numpy).
- [ ] Language dropdown labels: codes ("en", "pt-BR") or full names ("English", "Português").
- [ ] Language dropdown on phones: visible next to the hamburger (current) or inside the menu.
- [ ] Where the shared look-ahead scheduler lives: in shared.js or a separate module.
- [x] Portuguese wording of "take" (currently "gravação").
- [x] "Diapasão" for the pitch pipe: it literally means tuning fork. Check with another Brazilian musician.
- [ ] Pitch pipe waveform: sine (current) vs triangle/custom. Triangle is easier to hear on laptop and phone speakers (missing fundamental).
- [ ] First-visit note style: from the page language (pt-BR -> Do Re Mi, en -> letters) or always letters.
- [ ] Changing instrument while the tone is playing: keep playing on the new instrument's first string (current behavior, cheapest) or stop.
- [x] Accidental selected (say C♯4): the note select shows "C" while the now-playing line says "C♯4". Keep on purpose or change.
- [ ] JS naming: variables are snake_case but functions mix camelCase (updateDisplay, midiToFreq) and snake_case (start_tone, set_button_label). Pick one before the codebase grows.

## Known bugs

- [ ] A4 input, empty field: Number('') is 0, which passes Number.isFinite and clamps to 415 silently. It should restore the last valid A4 instead.
- [ ] letterToMidi returns null for an unknown letter, and Number(null) is 0, so it would clamp to the lowest note. It can't happen with the current select; guard it before the tuner reuses it.

## Cleanups

pitchpipe.js
- [ ] note_select and octave_select handlers call updateDisplay() right after setMidi(), which already calls it.
- [ ] Redundant Number(...) wraps (Number(letterToMidi(...)), Number(new_octave) - Number(current_octave)).
- [ ] fullName(midi) has a parameter named midi that shadows the module-level midi. Harmless, but easy to misread.
- [ ] The audio variables (context, oscillator, gain, start_attempt) are declared mid-file; consider moving them up with the other state variables.

app.py
- [ ] session and os are imported but unused.
- [ ] Trailing space after `from pathlib import Path`.

Templates and translations
- [ ] layout.html: the navbar link list is hand-written; it could loop over FEATURES like index.html does.
- [ ] index.html: tagline is an <h2>; <p class="lead"> would be more semantic (optional).
- [ ] pt-BR tagline capitalizes the tool names mid-sentence ("Diapasão", "Afinador"...); Portuguese normally doesn't.
- [ ] metronome.html, tuner.html, looper.html are placeholders: hard-coded "Hello ..." text and no title block. metronome.js, tuner.js and looper.js are empty.

Citations (CS50 requires citing AI use in comments)
- [ ] shared.js has no citation comment at all.
- [ ] Check layout.html (link loop, .navbar-top wrapper), the stretched-link approach in index.html, inject_constants in app.py, and the parts of pitchpipe.js that are not already cited.

## To verify in a browser

- [ ] pt-BR: every label on the pitch pipe page translated, no raw keys.
- [ ] Navbar below 576px with the menu open (brand, dropdown and hamburger on one row).
- [ ] stop_tone: oscillator and gain are set to null in two separate statements (not `oscillator, gain = null`), then click Start/Stop quickly about ten times.
- [ ] Each instrument: first string selected, all open strings listed (ukulele order is G C E A).
- [ ] Chromatic: ♭ disabled at A0, ♯ disabled at C8.
- [ ] Reference values: A4 = 440.0 Hz, C4 = 261.6, guitar E2 = 82.4, bass E1 = 41.2.

## Pitch pipe, still to do

- [ ] 3c: updateTone() called from updateDisplay(), so the pitch follows the UI while playing (setTargetAtTime).
- [ ] 3d: tone quality (waveform decision above).
- [ ] 5: preferences in localStorage (helpers in shared.js, try/catch, validate on load).
- [ ] Final pass: keyboard, narrow window, pt-BR, citations.
