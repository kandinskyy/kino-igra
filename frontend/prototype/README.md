# OVERRATED — visual prototype

Run from the repository root: `npm run prototype`.
Open http://localhost:4174. This server binds only to localhost and does not use production credentials, Socket.IO or room state.

Four interactive screens: home, lobby, rating round, results. Use the top navigation, or create a demonstration room and start the round. Rank buttons swap assigned ranks; the fifth rank fills automatically. The clock can start and pause. Results use an independent set of sample ballots, not online players or the visitor's current choices.

Three directions, switchable with the bottom bar or left/right arrows outside inputs:
- `?variant=A` — После сеанса: split layout, fanned posters, compact entry panel. Recommended.
- `?variant=B` — Киноафиша: editorial type, vertically staged entry, a full-width film strip.
- `?variant=C` — Общий стол: central headline, horizontal entry and panoramic posters.

Shared visual system: navy-black #080f16, surfaces #101a24, warm white #f1f0e9, restrained blue #a5c7df, muted gold #d9bb83. The product's five ranks and film posters are the visual subject; there is no stock photography or advertising. Film images are local copies of five posters from the project's existing catalog. Fonts are local/system fonts, with no remote font dependencies.

The animated rain uses three depth planes, delta-time motion, capped pixel density, pause on hidden tabs and reduced-motion support. The weather button switches it off. Phones show the five films in a swipeable horizontal rail with 44px rating controls.

This is a design proposal, not production-ready replacement code. Do not deploy it or wire it to real rooms without a separate integration and review. No push, deploy or production changes were performed.

Direction note: the taste-skill dark community draw supplied a quiet data-terminal hierarchy. Its monochrome base was adapted to the existing rainy navy identity explicitly retained in the brief; no live financial-dashboard content was adopted.
