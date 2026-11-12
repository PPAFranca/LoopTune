from flask import Flask, render_template, redirect, request, session, url_for
from pathlib import Path 
from urllib.parse import urlparse
import json
import os



app = Flask(__name__)

FEATURES = ["metronome", "pitchpipe", "tuner", "looper"]
SUPPORTED = ["en", "pt-BR"]
DEFAULT_LANG = "en"

# Load every translation file at startup
TRANSLATIONS = {}
for lang in SUPPORTED:
    path = Path(app.root_path) / "translations" / f"{lang}.json"
    with open(path, encoding="utf-8") as f:
        TRANSLATIONS[lang] = json.load(f)

# Drafted by Claude
def current_language():
    saved = request.cookies.get("lang")
    if saved in SUPPORTED:
        return saved
    for value, _quality in request.accept_languages:
        if value.lower().startswith("pt"):
            return "pt-BR"
        if value.lower().startswith("en"):
            return "en"
    return DEFAULT_LANG


# claude Sonnet 5.5 wrote this function
@app.route("/language/<lang>")
def set_language(lang):
    # Go back to the page the user came from, but only if it's on this site
    target = request.referrer
    if not target or urlparse(target).netloc != request.host:
        target = url_for("index")

    response = redirect(target)
    if lang in SUPPORTED:
        response.set_cookie("lang", lang, max_age=60 * 60 * 24 * 365, samesite="Lax")
    return response


# claude Sonnet 5.5 wrote this function
@app.context_processor
def inject_translations():
    lang = current_language()
    strings = {**TRANSLATIONS[DEFAULT_LANG], **TRANSLATIONS[lang]}

    def t(key):
        return strings.get(key, key)

    return {"lang": lang, "t": t, "translations": strings, "SUPPORTED": SUPPORTED, "FEATURES": FEATURES}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/metronome")
def metronome():
    return render_template("metronome.html")


@app.route("/pitchpipe")
def pitchpipe():
    return render_template("pitchpipe.html")


@app.route("/tuner")
def tuner():
    return render_template("tuner.html")


@app.route("/looper")
def looper():
    return render_template("looper.html")
