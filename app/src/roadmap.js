// roadmap.js — builds the platinum roadmap and the missables view purely
// from the official descriptions carried in data/trophies.json: chapters and
// named missions in order first, then collectibles with their counts, then
// activities, then the money / exploration / 100% cleanup.
export const ROADMAP_STAGE_NAMES = {
  1: "Stage 1 — Opening and Chapter 1",
  2: "Stage 2 — Chapters 2 to 4 and the named missions",
  3: "Stage 3 — Final mission, stranger strands and story cleanup",
  4: "Stage 4 — Collectibles and exploration, by the counts",
  5: "Stage 5 — Activities, challenges and one-off moments",
  6: "Stage 6 — Money, spending, 100% completion and the platinum",
};

export function groupTrophiesByStage(trophies) {
  const stages = new Map();
  for (const trophy of trophies) {
    if (!stages.has(trophy.stage)) stages.set(trophy.stage, []);
    stages.get(trophy.stage).push(trophy);
  }
  return [...stages.entries()].sort((a, b) => a[0] - b[0]);
}

export function renderRoadmap(container, trophies, earnedNames, onSelect) {
  container.replaceChildren();
  const flagged = trophies.filter((t) => t.missable);
  if (flagged.length) {
    const strip = document.createElement("div");
    strip.className = "roadmap-stage";
    const stripHeading = document.createElement("h3");
    stripHeading.textContent = "Missable-watch flags on this route — earn these when their moment comes";
    const stripText = document.createElement("p");
    stripText.textContent = flagged.map((t) => `MISSABLE: ${t.name} (stage ${t.stage})`).join(" · ");
    strip.append(stripHeading, stripText);
    container.append(strip);
  }
  for (const [stage, members] of groupTrophiesByStage(trophies)) {
    const block = document.createElement("div");
    block.className = "roadmap-stage";
    const heading = document.createElement("h3");
    heading.textContent = ROADMAP_STAGE_NAMES[stage] ?? `Stage ${stage}`;
    const list = document.createElement("ol");
    for (const trophy of members) {
      const item = document.createElement("li");
      const done = earnedNames.has(trophy.name) ? "Earned — " : "";
      const flag = trophy.missable ? " [MISSABLE — flagged from its official description]" : "";
      const count = trophy.count ? ` (${trophy.count})` : "";
      item.textContent = `${done}${trophy.name} (${trophy.grade})${count} — ${trophy.description}${flag}`;
      item.addEventListener("click", () => onSelect(trophy));
      list.append(item);
    }
    block.append(heading, list);
    container.append(block);
  }
}

export function renderMissables(container, trophies, onSelect) {
  container.replaceChildren();
  for (const trophy of trophies.filter((t) => t.missable)) {
    const card = document.createElement("div");
    card.className = "missable-card";
    const heading = document.createElement("h3");
    heading.textContent = `MISSABLE — ${trophy.name} (${trophy.grade})`;
    const body = document.createElement("p");
    body.textContent = `Official description: "${trophy.description}" Why it is flagged: ${trophy.missableReason ?? ""} Guide: ${trophy.guide} Source: ${trophy.source}`;
    card.append(heading, body);
    card.addEventListener("click", () => onSelect(trophy));
    container.append(card);
  }
}
