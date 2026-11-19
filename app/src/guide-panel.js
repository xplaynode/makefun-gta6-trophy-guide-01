// guide-panel.js — renders one trophy's full guide beside the checklist:
// official name, description and grade, the original guide text, numbered
// steps, a missable warning when flagged, its roadmap stage and its source.
export function describeGradeCounts(trophies, earnedNames) {
  const totals = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    if (!totals[trophy.grade]) continue;
    totals[trophy.grade][1] += 1;
    if (earnedNames.has(trophy.name)) totals[trophy.grade][0] += 1;
  }
  return totals;
}

export function renderGuidePanel(panel, placeholder, trophy, isEarned) {
  panel.replaceChildren();
  placeholder.hidden = true;
  const title = document.createElement("h2");
  title.textContent = trophy.name;
  const desc = document.createElement("p");
  desc.className = "guide-desc";
  desc.textContent = `Official description: "${trophy.description}" — Grade: ${trophy.grade}${trophy.count ? ` · PlayStation tracks: ${trophy.count}` : ""}${isEarned ? " · Earned" : " · Not yet earned"}`;
  const guideHeading = document.createElement("h3");
  guideHeading.textContent = "Guide — in our own words";
  const guideText = document.createElement("p");
  guideText.textContent = trophy.guide;
  panel.append(title, desc, guideHeading, guideText);
  if (Array.isArray(trophy.steps) && trophy.steps.length) {
    const stepsHeading = document.createElement("h3");
    stepsHeading.textContent = "Steps";
    const list = document.createElement("ol");
    for (const step of trophy.steps) {
      const item = document.createElement("li");
      item.textContent = step;
      list.append(item);
    }
    panel.append(stepsHeading, list);
  }
  if (trophy.missable) {
    const warning = document.createElement("p");
    warning.className = "missable-warning";
    warning.textContent = `MISSABLE — do this when the moment comes. ${trophy.missableReason ?? ""}`;
    panel.append(warning);
  }
  const stage = document.createElement("p");
  stage.textContent = `Roadmap stage ${trophy.stage}: ${trophy.stageName}. Kind: ${trophy.kind}.`;
  const source = document.createElement("p");
  source.className = "source-citation";
  source.textContent = `Source: ${trophy.source}`;
  panel.append(stage, source);
}
