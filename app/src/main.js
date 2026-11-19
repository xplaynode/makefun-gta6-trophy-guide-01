// main.js — Leonida Ledger entry point: loads data/trophies.json, wires the
// checklist, guide panel, roadmap and missables views, the filters, the
// spoiler shield, export / import, and the deterministic screenshot scenes
// (?view=, ?kind=, ?open=<id>, ?seed=<ids>, ?spoiler=1) that shots.json names.
import { loadEarnedNames, saveEarnedNames, loadSpoilerShield, saveSpoilerShield, seedEarnedNames, exportProgressFile, importProgressFile } from "./storage.js";
import { renderChecklist } from "./tracker.js";
import { renderGuidePanel, describeGradeCounts } from "./guide-panel.js";
import { renderRoadmap, renderMissables } from "./roadmap.js";

const dataResponse = await fetch("data/trophies.json");
const trophyData = await dataResponse.json();
const trophies = trophyData.trophies;
const params = new URLSearchParams(location.search);

let earnedNames = loadEarnedNames();
let selectedName = null;
let currentView = "checklist";

const elements = {
  rows: document.getElementById("trophy-rows"),
  resultCount: document.getElementById("result-count"),
  summary: document.getElementById("progress-summary"),
  fill: document.getElementById("progress-fill"),
  gradeCounts: document.getElementById("grade-counts"),
  kind: document.getElementById("filter-kind"),
  grade: document.getElementById("filter-grade"),
  state: document.getElementById("filter-state"),
  search: document.getElementById("filter-search"),
  spoiler: document.getElementById("spoiler-toggle"),
  guidePanel: document.getElementById("guide-content"),
  guidePlaceholder: document.getElementById("guide-placeholder"),
  main: document.getElementById("ledger-main"),
  controls: document.getElementById("controls-bar"),
  roadmapPane: document.getElementById("roadmap-pane"),
  roadmapStages: document.getElementById("roadmap-stages"),
  missablesPane: document.getElementById("missables-pane"),
  missableRows: document.getElementById("missable-rows"),
};

if (params.get("seed")) {
  const wanted = new Set(params.get("seed").split(",").map((v) => Number(v)));
  earnedNames = seedEarnedNames(trophies.filter((t) => wanted.has(t.id)).map((t) => t.name));
}
elements.spoiler.checked = params.get("spoiler") === "1" ? true : loadSpoilerShield();
if (params.get("kind")) elements.kind.value = params.get("kind");
if (params.get("grade")) elements.grade.value = params.get("grade");

function currentFilters() {
  return { kind: elements.kind.value, grade: elements.grade.value, state: elements.state.value, search: elements.search.value.trim() };
}

function selectTrophy(trophy) {
  selectedName = trophy.name;
  renderGuidePanel(elements.guidePanel, elements.guidePlaceholder, trophy, earnedNames.has(trophy.name));
  renderAll(false);
}

function renderProgress() {
  const total = trophies.length;
  const done = earnedNames.size;
  const pct = Math.round((done / total) * 100);
  elements.summary.textContent = `${done} of ${total} earned — ${pct}% toward the platinum`;
  elements.fill.style.width = `${pct}%`;
  const counts = describeGradeCounts(trophies, earnedNames);
  elements.gradeCounts.textContent = `Platinum ${counts.platinum[0]}/${counts.platinum[1]} · Gold ${counts.gold[0]}/${counts.gold[1]} · Silver ${counts.silver[0]}/${counts.silver[1]} · Bronze ${counts.bronze[0]}/${counts.bronze[1]}`;
}

function renderAll(rebuildViews = true) {
  renderProgress();
  const shown = renderChecklist(elements.rows, trophies, {
    filters: currentFilters(),
    earnedNames,
    selectedName,
    spoilerOn: elements.spoiler.checked,
  }, {
    onToggle(trophy, checked) {
      if (checked) earnedNames.add(trophy.name); else earnedNames.delete(trophy.name);
      saveEarnedNames(earnedNames);
      if (selectedName === trophy.name) selectTrophy(trophy);
      renderAll(false);
    },
    onSelect: selectTrophy,
  });
  elements.resultCount.textContent = `Showing ${shown} of ${trophies.length} trophies — click a row for its full cited guide.`;
  if (rebuildViews) {
    renderRoadmap(elements.roadmapStages, trophies, earnedNames, selectTrophy);
    renderMissables(elements.missableRows, trophies, selectTrophy);
  }
}

function showView(view) {
  currentView = view;
  for (const button of document.querySelectorAll("#view-tabs button")) {
    button.classList.toggle("active-view", button.dataset.view === view);
  }
  elements.main.hidden = view !== "checklist";
  elements.controls.hidden = view !== "checklist";
  elements.roadmapPane.hidden = view !== "roadmap";
  elements.missablesPane.hidden = view !== "missables";
  if (view === "roadmap") renderRoadmap(elements.roadmapStages, trophies, earnedNames, selectTrophy);
  if (view === "missables") renderMissables(elements.missableRows, trophies, selectTrophy);
}

for (const button of document.querySelectorAll("#view-tabs button")) {
  button.addEventListener("click", () => showView(button.dataset.view));
}
for (const control of [elements.kind, elements.grade, elements.state]) control.addEventListener("change", () => renderAll(false));
elements.search.addEventListener("input", () => renderAll(false));
elements.spoiler.addEventListener("change", () => { saveSpoilerShield(elements.spoiler.checked); renderAll(false); });
document.getElementById("export-progress").addEventListener("click", () => exportProgressFile(earnedNames));
document.getElementById("import-progress").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  earnedNames = await importProgressFile(file);
  saveEarnedNames(earnedNames);
  renderAll();
});

renderAll();
const openId = Number(params.get("open"));
if (openId) {
  const trophy = trophies.find((t) => t.id === openId);
  if (trophy) selectTrophy(trophy);
}
showView(params.get("view") ?? "checklist");
if (currentView !== "checklist" && openId) {
  const trophy = trophies.find((t) => t.id === openId);
  if (trophy) selectTrophy(trophy);
}
