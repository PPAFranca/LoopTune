LoopTune: project status

Last updated: 2026-11-19. Based on the actual files (app.py, layout.html, index.html, pitchpipe.html, pitchpipe.js, shared.js, style.css, en.json, pt-BR.json, requirements.txt). Update at the end of each work session and re-upload.

Done
Environment: local VS Code, venv, Flask 3.1.3 (pinned in requirements.txt), Git + GitHub. Last known Git state (2026-11-11): one commit pushed, "Add page layout, templates and translation files". The index polish, style.css, pitch pipe and shared.js work is probably NOT committed yet: run git status and commit.
app.py: routes for /, /metronome, /pitchpipe, /tuner, /looper (all just render their template). FEATURES, SUPPORTED, DEFAULT_LANG, translations loaded at startup, current_language() (cookie -> Accept-Language -> English), context processors (lang, t, translations, SUPPORTED, FEATURES), set_language route /language/<lang> (cookie, same-site redirect). No secret key or .env needed.
layout.html: Bootstrap 5.3.8 (jsDelivr CDN), dark theme, sticky navbar (navbar-expand-sm) with a .navbar-top wrapper holding brand, language dropdown and toggler, so the hamburger stays on the first row on phones. Collapse with four tool links and aria-current="page" on the active one. window.I18N script, main inside container my-5, title/main/scripts blocks.
index.html: hero (h1 + tagline) and four cards built in a Jinja loop over FEATURES. The whole card is clickable (stretched-link, with a visually hidden tool name for screen readers).
style.css: .hero, .cards grid (2 columns, 1 on phones), .input-narrow (for the A4 field), and the two media queries for .navbar-top.
Translations: en.json and pt-BR.json are valid JSON with the same 36 keys (app.title, nav.* and home.* = 11; common.* = 11; solfege.* = 7; instrument.* = 7).
shared.js: INSTRUMENTS_PRESETS (open-string MIDI notes plus min/max MIDI for chromatic, guitar, bass, violin, viola, cello, ukulele), clamp, midiToFreq, letterToMidi, midiToName, stepSemitone. Checked by running the functions in Node: A4 = 440.00 Hz, C4 = 261.63, guitar E2 = 82.41, bass E1 = 41.20, A0 = 27.50, C8 = 4186.01; with the A4 reference at 415 and 466 the A4 frequency is exactly 415 and 466; C4 = MIDI 60, C0 = 12; MIDI 61 is C♯4 (sharps) or D♭4 (flats).
Pitch pipe page, UI only (NO SOUND YET). Template: instrument select, note-style radios (A / Do), A4 number input, note select, chromatic-only octave select + ♭/♯ buttons, now-playing line, Start button. JS: fills the instrument, octave and note selects; shows note name and frequency; ♭/♯ stepping clamped to the preset range with the buttons disabled at the ends (A0 and C8); instrument switching (open strings for real instruments, chromatic controls hidden); note-name style switching (letters or Do Re Mi).
Not verified in a browser: I only read the code and ran the shared.js maths in Node. Please click through the pitch pipe page once before trusting this list.
Old known issues: resolved or changed
layout.html: hero text-center removed from the site header; aria-controls fixed; link list is mt-2 mt-sm-0; the <title > typo is gone.
layout.html navbar order on phones: solved with the .navbar-top wrapper + CSS. Still to confirm in the browser (window narrower than 576px, menu open).
index.html: h5 removed from the card text; instead of a translated "Open" link, the whole card is a stretched link.
style.css is no longer empty.
Still open: layout, index and cleanups
Language dropdown shows raw codes ("en", "pt-BR"). See open decisions.
The navbar link list is a hand-written list of (endpoint, key) pairs in layout.html; it could loop over FEATURES like index.html does.
Tagline is an <h2> (styled through .hero h2). Works; <p class="lead"> would be more semantic. Optional.
app.py: session and os are imported but unused; there is a trailing space after from pathlib import Path.
pt-BR tagline capitalizes "Diapasão" (and the other tool names) mid-sentence; Portuguese normally doesn't.
common.start/common.stop: English is "START"/"STOP" (all caps), Portuguese is "Iniciar"/"Parar". Pick one style.
metronome.html, tuner.html, looper.html are placeholders (<h1>Hello ...</h1>, hard-coded text, no title block). static/js/metronome.js, tuner.js and looper.js are empty.
Code style: JS mixes snake_case variables (use_flats, min_midi) with camelCase functions (midiToFreq). Pick one before the codebase grows.
Pitch pipe: bugs found by reading the code
Note style mismatch on load: pitchpipe.html has the "A" (letters) radio checked, but pitchpipe.js starts with note_style = 'solfege'. First load shows Do/Re/Mi labels with the letters button highlighted.
The A4 input does nothing: a4_input is selected but has no listener, so a4 stays 440 and the frequency never changes. The min/max attributes on the input don't stop typed values.
No sound: play_btn and playing are never used. The Start button has no listener.
Redundant calls: the note and octave handlers call updateDisplay() right after setMidi(), which already calls it. Also double Number(...) wraps. Harmless, tidy up.
letterToMidi returns null for an unknown letter, and Number(null) is 0, so it would silently clamp to the lowest note. Can't happen with the current select; guard it before the tuner reuses it.
With an accidental selected (say C♯4), the note select shows "C" while the now-playing line says "C♯4". Probably fine, but decide on purpose.
The Start button has aria-pressed="false" and its label will switch to STOP. Use one pattern only: constant label + aria-pressed, or changing label without aria-pressed. Otherwise a screen reader says "STOP, pressed".


Pitch pipe roadmap

Phase 1: fix the bugs (small, then commit)
Make the note style start from one source of truth (the checked radio now, localStorage later).
Wire the A4 input to the change event, not input: typing "440" passes through "4" and "44", and clamping mid-typing would fight the user. Handler: if the field is empty or NaN, restore the last valid value (Number('') is 0 and would silently become 415); otherwise clamp to 415-466, write the clamped value back into the field, update a4, call updateDisplay().
Remove the redundant updateDisplay() calls and double Number().
Done when: A4 = 415 shows 415.0 Hz for A4; 500 snaps to 466; empty snaps back; the highlighted style button always matches the labels on load.

Phase 2: sound
Create the AudioContext on the first Start click (browsers block audio before a user gesture) and resume() it if it is suspended. One context for the page.
OscillatorNode -> GainNode -> destination. Oscillators are one-shot: create a new one on each Start; never reuse one after stop().
Fade in and out with a short gain ramp (tens of milliseconds) instead of jumping 0 <-> 1, otherwise you hear a click. Stop the oscillator after the fade-out ends.
While playing, changing the note, octave, string, ♭/♯ or A4 changes the oscillator's frequency in place (short ramp) instead of restarting.
Start with a low gain and test with headphones.
Waveform: a pure sine is thin and nearly inaudible for low notes on laptop and phone speakers (bass E1 is 41 Hz, guitar E2 82 Hz). A triangle wave, or a custom wave with a few harmonics, is easier to hear and to match by ear, because the ear infers the pitch from the harmonics even when the speaker cannot reproduce the fundamental ("missing fundamental"). Try triangle first.
Button text from i18n (common.start/common.stop) and the aria pattern from bug 7.
Done when: Start gives a steady tone at midiToFreq(midi, a4); Stop is click-free; changing anything while playing updates the pitch without restarting; no console errors in Chrome and Firefox.

Phase 3: preferences (localStorage)
Save instrument, A4 and note style (not the playing state; the last note is optional).
Every read and write in try/catch. Validate on load: instrument must be a key of INSTRUMENTS_PRESETS, A4 clamped to 415-466, style one of letters/solfege; otherwise use the defaults.
Put the load/save helpers in shared.js with one key prefix, because the tuner needs the same three settings and both pages must read the same values.
Decide the first-visit note style (see open decisions).
Done when: settings survive a reload; with a corrupted value set by hand in DevTools, the page still loads with defaults.

Phase 4: polish, review, commit
Switch to pt-BR: every label translated (Lá, Dó...), no raw keys, aria-labels translated. Any new key goes into both JSON files in the same commit.
Narrow window: controls wrap sensibly, buttons are easy to tap.
Keyboard: tab order, Start works with Space/Enter, selects work from the keyboard.
Cite every part of pitchpipe.js and shared.js that Claude helped with (see citations below).
Stretch, only after the core works: buttons for the open strings (one tap plays that string) instead of the dropdown; volume slider; waveform choice.
When the tuner starts, move noteLabel and fullName into shared.js so both pages share the naming code.
Commit, for example "Add pitch pipe and shared note maths".
Manual test checklist (before the commit)
Each instrument: first string selected, all open strings listed (ukulele order is G C E A).
Chromatic: ♭ disabled at A0, ♯ disabled at C8.
Reference values: A4 = 440.0 Hz, C4 = 261.6, guitar E2 = 82.4, bass E1 = 41.2.
Change instrument and note style while the tone is playing.
English and pt-BR; reload with saved preferences.
Citations still to add or check (CS50 requires citing AI use in comments)
Already cited: current_language(), set_language, inject_translations, the ~ operator in index.html, the dropdown in layout.html, the four style.css blocks, the header of pitchpipe.html, stepBy and changeNoteStyle in pitchpipe.js.
To check, I can't tell from the files what came from Claude: the layout.html link loop and .navbar-top wrapper (only the dropdown has a comment), the stretched-link approach in index.html, inject_constants in app.py, shared.js (no citation comment at all), and the rest of pitchpipe.js.
Next
Commit what exists. Fix the open layout/cleanup items (small).
Pitch pipe phases 1 to 4; commit after each phase.
Metronome (shared scheduler module, also reused by the looper), tuner, looper.
Add JS-side strings (tuner.mic_denied, ...) to both JSON files as pages are built.
Open decisions
Looper mixdown: in the browser (OfflineAudioContext, no new dependency) or on the server (numpy).
Language dropdown labels: codes or full names ("English", "Português").
Language dropdown on phones: visible next to the hamburger (current) or inside the menu.
Wording of "take" in Portuguese (currently "gravação").
Pitch pipe waveform: sine vs triangle/custom.
First-visit note style: from the page language (pt-BR -> Do Re Mi, en -> letters) or always letters.
Changing instrument while the tone is playing: keep playing on the new instrument's first string (suggested) or stop.
"Diapasão" for the pitch pipe: it literally means tuning fork. Fine in practice since the app plays a reference tone, but I'm not sure it is the most natural word for a pitch pipe; worth a quick check with another Brazilian musician.
Notes for the CS50 writeup
Local Flask instead of hosting: localhost is a secure context, so microphone access works.
All audio is client-side Web Audio. Flask serves pages and, for the looper, stores files and data.
Language stored in a plain cookie, with no secret key and no .env, so the app runs with zero setup.
Look-ahead scheduling for the metronome, because setInterval drifts.
Bootstrap (CDN) used for layout and components.
Notes are MIDI numbers internally; note names (letters or Do Re Mi) are display-only; the A4 reference (415-466) is separate from naming.
Instrument presets (open strings and playable range) live in shared.js and are shared by the pitch pipe and the tuner.