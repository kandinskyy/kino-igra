# Kinonames — implementation and verification

## Scope and owner decisions

2026-11-13: integrate into existing rooms, stable session identities and Socket.IO connection. No second room server or websocket client. No push or deployment is authorized for this task.

The owner changed the artwork requirement during implementation: **text-only cards, no portraits**. The neutral front displays the character name; opening flips to a named color for guessers. A later owner clarification removes all leader preview/pinning: leaders always see each card's color and name, with no hover, click or touch view switching. No image licensing or downloading is required for this version.

## Architecture

- `backend/kinonames.js`: serializable authoritative state machine, settings, assignments, clues, votes, deadlines, results, role-filtered snapshots.
- `backend/kinonames-room.js`: adapter to existing room map, socket membership, personalized emit and room persistence. A single 100 ms scheduler handles transitions; there are no per-room timer handles in snapshots.
- `backend/server.js`: mode selection, creator identity, start/restart, personalized wire view, legacy-event rejection and leader removal protection.
- `frontend/src/kinonames/KinonamesUI.jsx` and `kinonames.css`: shared desktop/mobile settings, teams, text board and results. Existing `CinemaLobby`, `MatchSettings`, mobile `Lobby`, `App` and `CinemaApp` connect these components to the existing site.
- `shared/kinonames/catalog.json`: 819 unique stable IDs, merging 608 prompt entries and 212 unique DOCX entries; `Арес` overlaps. Original Downloads DOCX remains unchanged. Sources and ambiguous names are recorded in the catalog README.

## Rules and defaults

Coop defaults: 9 clues, 9 blue targets, 3 black cards, 2 lives; neutral count is derived. There is no thinking/guessing timer or time bonus. Running Kinonames with connected players is exempt from the legacy 15-minute inactivity cleanup; offline retention remains unchanged. Exhausted clues do not end a party.

Competitive defaults: 60 seconds for the clue, 120 seconds for guesses; fixed 8 blue, 8 red, 8 neutral, 1 black. First team is selected randomly on the server using cryptographic randomness. Correct own-team cards add 15 seconds once. Turn expiry wins a tie with card confirmation. Clue numbers do not limit guesses.

Traitors: one nonleader chosen independently per team at party start; minimum 8 online players and 4 per team. The traitor privately sees opposing colors and black cards, following [the reference rules](https://meme-police.com/bg). Other players never receive their identity. Leaders see all colors, ordinary guessers only opened colors.

Unanimity uses connected guessers of the active team. No voters means no opening; a lone connected traitor cannot open alone. A changed voter roster resets confirmation. Confirmation starts at 3 seconds, or opens immediately if newly reached with at most 5 seconds on the competitive guessing clock. An already running 3-second confirmation is not shortened on crossing that threshold.

Guessing clocks continue when guessers disconnect; disconnected guessers do not count toward unanimity. During a competitive clue phase, a disconnected leader gets a 20-second reconnect grace with the clue clock paused. Return resumes the remaining time; expiry randomly promotes an eligible connected teammate and grants a fresh clue clock, or starts guessing without a clue when only one guesser remains. Session-token reconnect restores membership and its permitted board view. Late memberships now enter a separate waiting room and cannot mutate or inspect the active game.

Only the room creator edits Kinonames-specific parameters, including after host transfer. The current host still controls general mode selection/start/restart. Mode changes preserve the previous rating-game category/target/toggle preset. Device preferences retain both varieties separately within a Kinonames-only record; room state remains authoritative.

## Protocol

- `kinonames_settings {lobbyId, settings}` — creator only, lobby only; validates complete settings.
- `kinonames_assign {lobbyId, team, leader}` — participant chooses their own role; occupied connected leader positions cannot be taken. During play, only own-team role changes are allowed. Team transfers are allowed in the lobby and between parties.
- `kinonames_action {lobbyId, action}` — `clue`, `request_clue`, `vote`, `ready`; requires matching `gameId` and `turnId`. Role, phase, membership and deadlines are validated server-side.
- Existing `launch_game` and `restart_game` remain the start/reset controls.
- `lobby.kinonames` contains settings, public assignments, creator ID and a personalized game view. Private engine roles and closed-card colors are never spread into public room payloads. `serverNow` supports clock offset correction on clients.

## Verification and remaining work

Full Node regression suite: **52/52 passed**, including engine rules, real two-player coop and eight-player competitive/traitor sockets, legacy modes, room persistence, category switching and session identity. A subsequent targeted run passed 20/20 after adding an unsafe-deadline regression assertion.

Independent security review covered wire secrecy, membership, creator rights, voting races and timer bounds. Findings fixed: unsafe timestamp arithmetic, leader removal deadlock, disconnected pregame leader reservation, mode switching after host transfer and category validation on return to rating games. Initial combined test runs exposed conflicting test ports; Kinonames tests now use 3198/3199, separate from legacy tests.

Browser-based visual and touch checks are **not performed**: the browser approval gate denied `http://localhost:5173`; no alternative browser or indirect workaround was attempted. Responsive CSS and reduced-motion handling are implemented, but final visual acceptance on desktop/mobile remains necessary before declaring the feature ready for publication.

Scoped Oxlint passed. Vite production build passed into `C:/Windows/TEMP/kino-kinonames-build-20261113`; the existing cinema large-chunk advisory remains. React server rendering checked 25 board cards for leader/guesser views, team rosters and mobile settings without runtime render errors. This does not substitute for browser, layout or touch verification.

Production is unchanged. Publication would require explicit approval, the frontend production build and backend/shared catalog release together, restart of the existing Node service, and a two-browser online smoke test. No new dependencies, environment secrets, image service or database migration are needed. Local development servers are running at http://localhost:5173 (frontend) and port 3001 (backend).

## Approved revision — 2026-11-13

Implemented in the real application, without creating another prototype. The 819-character catalogue is unchanged pending the owner's next review.

- Text-only ivory cards, more saturated team colors, muted gold neutral text, horizontal team-colored vote progress, separate team histories and a running timer bar. Leader cards remain permanently colored; no portrait/view toggle.
- Lobby leader slot is always first. Current leaders can move to a free guesser slot; teammates can click the empty leader slot. Kinonames variety uses the compact «Режим» dropdown, with numeric settings in «Настройка режима». All members can view them; creator-only editing remains enforced server-side.
- Initial competitive seating alternates teams and selects the first member as leader. Rematch promotes waiting members, shuffles teams/leaders, creates a new hidden board, and waits for every connected member's «Готов». Role changes reset readiness. Traitors are assigned only after final ready teams are fixed.
- Final board reveals all 25 cards. Team/history panels remain. The host's «Новая партия» is centered below the board. Same-team role changes remain available during a match; cross-team moves are blocked until the party ends.
- Shared primary/secondary button geometry is unified across original, opinion and Kinonames screens; compact text/icon/rating controls keep their intended semantics. Mobile role control stays in the sticky header rather than covering team content or chat.
- Waiting-room UI is integrated into desktop and mobile applications for all modes. Waiting users receive minimal snapshots and cannot vote, change settings, or pause legacy games by leaving/disconnecting.
- Entry direction regression fixed: pending forward game entry cannot trigger a reverse journey before the portal.

Validation: root Node suite **68/68 PASS**, explicit scene-direction and WebAudio tests **2/2 PASS**, scoped Oxlint clean, Impeccable detector no findings, production Vite build PASS in Windows TEMP. Existing >500kB cinema bundle advisory remains. Independent backend security review: no unresolved P0/P1/P2 in reviewed paths; two found issues fixed (waiting-user timer interference and pre-ready traitor distribution).

Real-app browser checks: room creation, competitive seating, settings dialog, claiming a vacant leader slot during play, desktop 1280×720 and mobile 390×844 layouts, waiting→next-party admission, hidden ready board, all-ready start, team vote strip, confirmation, final 25-card reveal. No horizontal overflow at 390, 1280, 1920 or 2560 widths. Screenshot: design-previews/kinonames-integrated/finished-2560.jpg. Tests used temporary local socket participants, not a newly assembled demo. Full manual visual acceptance remains the owner's next step; automated sound verification does not claim a subjective listening review.

No push or deployment performed. Release still requires explicit approval and shipping backend/frontend/shared code together. Older fixed-role/no-late-join and browser-unverified notes above describe the previous revision and are superseded by this section.
