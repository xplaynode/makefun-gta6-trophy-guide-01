// storage.js — earned-progress persistence for the Leonida Ledger tracker.
// Progress lives in localStorage as a JSON array of trophy names, and the same
// array shape is what export downloads and import reads back.
export const PROGRESS_STORAGE_KEY = "leonida-ledger-earned-v1";
export const SPOILER_STORAGE_KEY = "leonida-ledger-spoiler-v1";

export function loadEarnedNames() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === "string") : []);
  } catch {
    return new Set();
  }
}

export function saveEarnedNames(earnedNames) {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify([...earnedNames]));
}

export function loadSpoilerShield() {
  return localStorage.getItem(SPOILER_STORAGE_KEY) === "on";
}

export function saveSpoilerShield(isOn) {
  localStorage.setItem(SPOILER_STORAGE_KEY, isOn ? "on" : "off");
}

export function seedEarnedNames(names) {
  saveEarnedNames(new Set(names));
  return new Set(names);
}

export function exportProgressFile(earnedNames) {
  const blob = new Blob([JSON.stringify([...earnedNames], null, 2)], { type: "application/json" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = "leonida-ledger-progress.json";
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export async function importProgressFile(file) {
  const parsed = JSON.parse(await file.text());
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error("Progress file holds no trophy list.");
  return new Set(names.filter((n) => typeof n === "string"));
}
