import { INSTRUMENTS_PRESETS } from "./shared.js";

const instrumentSelect = document.getElementById("instrument");

for (const key of Object.keys(INSTRUMENTS_PRESETS)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = window.I18N["instrument." + key] ?? ("instrument." + key);
    instrumentSelect.appendChild(option);
}