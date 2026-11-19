# Leonida Ledger — Platinum Route

Leonida Ledger is an offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5, built for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/xplaynode/makefun-gta6-trophy-guide-01/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/xplaynode/makefun-gta6-trophy-guide-01/reward.svg)

What it does:

- Tracks all 55 official PlayStation 5 trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with their official names, descriptions and grades, earned checkboxes, a progress bar and per-grade counts. Progress is saved in localStorage and can be exported to a file and imported back.
- Gives every trophy a full guide in original words — what to do, where and how, when it can be missed — with numbered steps and a named source citation beside each guide.
- Builds a platinum roadmap from the official descriptions: story chapters and named missions in order first, then collectibles with their PlayStation counts, then activities, then the money and 100% cleanup. Missable-watch trophies are flagged in the roadmap and collected in a dedicated Missables view, each flag justified from the trophy's own official description.
- Filters by kind (story, missable, collectibles, activities, online), by grade and by earned state, plus text search, and offers a spoiler shield that hides the names and descriptions of story trophies until they are earned.

The app is plain static files under `app/` with no build step and no network requests at run time. Serve it with `node serve.ts` and open http://localhost:8080. Run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` to produce the dossier the judge reads.

Competition: https://make.fun/bounty/gta6-trophy-guide-01
