// tracker.js — the checklist itself: one ledger row per trophy with an
// earned checkbox, official name / description / grade, kind, count and
// missable flag, filtered by kind, grade, earned state and search text.
// The spoiler shield masks story trophies (name and description) until earned.
export function trophyMatchesFilters(trophy, filters, earnedNames) {
  if (filters.kind === "missable" && !trophy.missable) return false;
  if (filters.kind !== "all" && filters.kind !== "missable" && trophy.kind !== filters.kind) return false;
  if (filters.grade !== "all" && trophy.grade !== filters.grade) return false;
  const isEarned = earnedNames.has(trophy.name);
  if (filters.state === "earned" && !isEarned) return false;
  if (filters.state === "unearned" && isEarned) return false;
  if (filters.search) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

export function isMaskedBySpoilerShield(trophy, spoilerOn, earnedNames) {
  return spoilerOn && trophy.kind === "story" && !earnedNames.has(trophy.name);
}

export function buildTrophyRow(trophy, state, handlers) {
  const row = document.createElement("div");
  row.className = "trophy-row" + (state.selected ? " selected-row" : "");
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = state.earned;
  box.setAttribute("aria-label", `Mark ${trophy.name} earned`);
  box.addEventListener("click", (event) => event.stopPropagation());
  box.addEventListener("change", () => handlers.onToggle(trophy, box.checked));
  const text = document.createElement("span");
  text.className = "row-text";
  const name = document.createElement("span");
  name.className = "trophy-name" + (state.masked ? " masked-name" : "");
  name.textContent = state.masked ? "Hidden story trophy — earn it to reveal" : trophy.name;
  const desc = document.createElement("span");
  desc.className = "trophy-desc";
  desc.textContent = state.masked ? "Name and description hidden by the spoiler shield." : trophy.description;
  text.append(name, desc);
  row.append(box, text);
  if (trophy.count) {
    const count = document.createElement("span");
    count.className = "count-tag";
    count.textContent = trophy.count;
    row.append(count);
  }
  const kind = document.createElement("span");
  kind.className = "kind-tag";
  kind.textContent = trophy.kind;
  const chip = document.createElement("span");
  chip.className = `grade-chip grade-${trophy.grade}`;
  chip.textContent = trophy.grade;
  row.append(kind, chip);
  if (trophy.missable) {
    const flag = document.createElement("span");
    flag.className = "missable-flag";
    flag.textContent = "MISSABLE";
    row.append(flag);
  }
  row.addEventListener("click", () => handlers.onSelect(trophy));
  return row;
}

export function renderChecklist(container, trophies, view, handlers) {
  container.replaceChildren();
  let shown = 0;
  for (const trophy of trophies) {
    if (!trophyMatchesFilters(trophy, view.filters, view.earnedNames)) continue;
    shown += 1;
    container.append(buildTrophyRow(trophy, {
      earned: view.earnedNames.has(trophy.name),
      selected: view.selectedName === trophy.name,
      masked: isMaskedBySpoilerShield(trophy, view.spoilerOn, view.earnedNames),
    }, handlers));
  }
  return shown;
}
