from flask import Flask, render_template, redirect, request, session
import os
import json
from pathlib import Path 

app = Flask(__name__)

SUPPORTED = ["en", "pt-br"]
DEFAULT_LANG = "en"

# Load every translation file at startup
TRANSLATIONS = {}
for lang in SUPPORTED:
    path = Path(app.root_path) / "translations" / f"{lang}.json"
with open(path, encoding="utf-8") as f:
    TRANSLATIONS[lang] = json.load(f)


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
@app.context_processor
def inject_translations():
    lang = current_language()
    strings = {**TRANSLATIONS[DEFAULT_LANG], **TRANSLATIONS[lang]}

    def t(key):
        return strings.get(key, key)

    return {"lang": lang, "t": t, "translations": strings}


@app.route("/")
def index():
    return "It works"