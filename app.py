import os
from pathlib import Path
from urllib.parse import urlparse
import json
from flask import Flask, render_template, redirect, request, url_for


app = Flask(__name__)

FEATURES = ["metronome", "pitchpipe", "tuner", "looper"]
SUPPORTED = ["en", "pt-BR"]
DEFAULT_LANG = "en"
SUBDIVISIONS = [{"value": "1", "pattern": "1", "alt": "Whole note"},
                {"value": "2", "pattern": "11", "alt": "Half note"},
                {"value": "3", "pattern": "111", "alt": "Quarter note"},
                {"value": "4", "pattern": "1111", "alt": "Eighth note"},
                {"value": "5", "pattern": "1001", "alt": "Sixteenth note"},
                {"value": "6", "pattern": "1100", "alt": "Thirty-second note"},
                {"value": "7", "pattern": "101011", "alt": "Sixty-fourth note"}]

# Load every translation file at startup
TRANSLATIONS = {}
for lang in SUPPORTED:
    path = Path(app.root_path) / "translations" / f"{lang}.json"
    with open(path, encoding="utf-8") as f:
        TRANSLATIONS[lang] = json.load(f)

# Drafted by Claude
def current_language():
    """Return the user's preferred supported language."""
    saved = request.cookies.get("lang")
    if saved in SUPPORTED:
        return saved
    for value, _quality in request.accept_languages:
        if value.lower().startswith("pt"):
            return "pt-BR"
        if value.lower().startswith("en"):
            return "en"
    return DEFAULT_LANG


# Written with help from Claude (Anthropic).
@app.route("/language/<lang>")
def set_language(lang):
    """Save the selected language and redirect to the previous page."""
    # Go back to the page the user came from, but only if it's on this site
    target = request.referrer
    if not target or urlparse(target).netloc != request.host:
        target = url_for("index")

    response = redirect(target)
    if lang in SUPPORTED:
        response.set_cookie("lang", lang, max_age=60 * 60 * 24 * 365, samesite="Lax")
    return response


# Written with help from Claude (Anthropic).
@app.context_processor
def inject_translations():
    """Make the active language and translation strings available to templates."""
    lang = current_language()
    strings = {**TRANSLATIONS[DEFAULT_LANG], **TRANSLATIONS[lang]}

    def t(key):
        return strings.get(key, key)

    return {"lang": lang, "t": t, "translations": strings}

@app.context_processor
def inject_constants():
    """Make supported languages and features available to templates."""
    return {"SUPPORTED": SUPPORTED, "FEATURES": FEATURES, "SUBDIVISIONS": SUBDIVISIONS}

@app.route("/")
def index():
    """Render the home page."""
    return render_template("index.html")


@app.route("/metronome")
def metronome():
    """Render the metronome page."""
    return render_template("metronome.html")


@app.route("/pitchpipe")
def pitchpipe():
    """Render the pitchpipe page."""
    return render_template("pitchpipe.html")


@app.route("/tuner")
def tuner():
    """Render the tuner page."""
    return render_template("tuner.html")


@app.route("/looper")
def looper():
    """Render the looper page."""
    return render_template("looper.html")
