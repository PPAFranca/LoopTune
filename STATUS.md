# LoopTune: project status

Last updated: 2026-11-11. Based on the actual files (app.py, layout.html, index.html, en.json, pt-BR.json). Update at the end of each work session and re-upload.

## Done
- Environment: local VS Code, venv, Flask, Git + GitHub. One commit pushed so far: "Add page layout, templates and translation files".
- app.py: routes for /, /metronome, /pitchpipe, /tuner, /looper (all just render their template). FEATURES list, SUPPORTED, DEFAULT_LANG, translations loaded at startup, current_language() (cookie -> Accept-Language -> English), context processor (lang, t, translations, SUPPORTED, FEATURES), set_language route `/language/<lang>` (cookie, same-site redirect). No secret key or .env needed.
- layout.html: Bootstrap 5.3.8 from the jsDelivr CDN (CSS in head, JS bundle), dark theme (`data-bs-theme="dark"`), sticky navbar with brand, four tool links, language dropdown built from SUPPORTED, `window.I18N` script, `main` inside `container my-5`, `title`/`main`/`scripts` blocks.
- index.html: hero section (h1 + tagline), four Bootstrap cards built in a Jinja loop over FEATURES using `t("nav." ~ f)` and `t("home." ~ f)`, link via `url_for(f)`.
- Translations: en.json and pt-BR.json are valid and have the same 12 keys (app.title, nav.*, home.heading, home.tagline, home.*). pt-BR uses "Diapasão" for the pitch pipe.
- Verified by rendering: "/" returns 200 in English and Portuguese, `<html lang>` follows the language, no raw keys on the page, four cards, two dropdown items, and /language/pt-BR sets the cookie and redirects.

## Not yet done / not reviewed
- static/css/style.css is empty. The `hero` class has no styling yet.
- metronome.html, pitchpipe.html, tuner.html, looper.html and all static/js files exist from the earlier commit but were not reviewed for this status. Assume placeholders.
- No tool has any functionality yet.

## Known issues to fix in layout.html
1. `<header class="hero text-center">`: remove `hero text-center` from the site header (it centers the navbar links). Keep them on the home page's intro section only.
2. Element order inside the navbar container is brand, collapse, dropdown, toggler. When the hamburger menu opens on a phone, the menu likely wraps between the brand and the dropdown/hamburger, pushing the hamburger to a row below. To check in the browser. Suggested order: brand, dropdown (`ms-auto me-2 order-md-last`), toggler, collapse.
3. `data-bs-controls` should be `aria-controls`.
4. `mt-2` on the link list should be `mt-2 mt-md-0`.
5. The language dropdown shows raw codes ("en", "pt-BR"). Option: show full names ("English", "Português").
6. The navbar link list is hard-coded in layout.html. It could loop over FEATURES like index.html does.
7. `<title >` has a stray space (harmless).

## Known issues to fix in index.html
- `<p class="h5 card-text">` makes the description heading-sized. Probably remove `h5`.
- The card link text repeats the tool name. Consider a translated "Open" key, and `stretched-link` to make the whole card clickable.
- The tagline is an `<h2>`; a `<p class="lead">` may suit better.

## Small cleanups
- app.py: `session` and `os` are imported but unused.
- pt-BR tagline capitalizes "Diapasão" mid-sentence; Portuguese normally doesn't capitalize common nouns there.

## Citations still to add (CS50 requires citing AI use in comments)
- current_language(): the first version was drafted by Claude.
- layout.html: the navbar link loop and the dropdown structure came from Claude's suggestions.
- set_language, the context processor and the `~` operator in index.html are already cited.

## Next
1. Fix the layout issues above and write style.css.
2. Pitch pipe, then shared.js (note/frequency maths), metronome, tuner, looper. Commit after each.
3. Add JS-side strings (common.start, common.stop, tuner.mic_denied, ...) to both JSON files as pages are built.

## Open decisions
- Looper mixdown: in the browser (OfflineAudioContext, no new dependency) or on the server (numpy).
- Language dropdown labels: codes or full names.
- Whether the language dropdown stays visible on phones (current) or moves into the hamburger menu.
- Wording of "take" in Portuguese (currently "gravação").

## Notes for the CS50 writeup
- Local Flask instead of hosting: localhost is a secure context, so microphone access works.
- All audio is client-side Web Audio. Flask serves pages and, for the looper, stores files and data.
- Language stored in a plain cookie, with no secret key and no .env, so the app runs with zero setup.
- Look-ahead scheduling for the metronome, because setInterval drifts.
- Bootstrap (CDN) used for layout and components.
