# OVERRATED — direction A, third local revision

## Fitted wardrobe, readable avatars and ready-state feedback (latest)

- Give the existing costume panels, sleeves, boots and accessories a consistent rounded light/shadow treatment, generated only for colors present in each SVG layer. Add soft hair/neck contact shadows and curved robe seams. Remove Widow's pale head-side sticks. No image assets or dependencies added.
- Remove legacy 16–21px SVG rules that shrank avatars inside their containers. Game roster portraits now fill 42px icons (38px narrow mobile); result portraits fill 32px icons. Remove the lobby's “Перед началом” label.
- When all players have voted, crossfade the ambient background and recolor rain, header, roster, movie surfaces, timer and reveal button to green. CSS transition is 0.9 seconds; reduced-motion keeps the existing no-animation behavior. Tier colors are preserved. Revealing scores restores the normal palette.
- Sort every film's revealed ballots by S, A, B, C, D, keeping same-tier player order stable and missing ratings last. The input player array is unchanged. A focused automated test covers this ordering.
- All four tests, lint and build pass (the same three pre-existing React warnings). Browser verified actual ballot ordering, full-size avatars, no missing SVG paints/duplicate IDs, a two-player ready/reveal cycle and 320px mobile layout. Removing the body's fixed minimum width also resolves overflow with classic desktop scrollbars: clientWidth and scrollWidth both 305px inside a 320px viewport. No push/deployment/production edits.

## Hair silhouettes, connected hands and transparent cloud (latest)

- Redraw the seventeen exposed film hairstyles as curved silhouettes with separate front/rear locks and strand detail. Remove their superseded costume hair paths so two hairstyles cannot overlap. Headgear remains above the new hair layers.
- Replace the old bare arm pipes, floating round hands and underlying white body/leg panels with complete costume sleeves, connected rounded robot hands and clothed legs. Arm accessories stay in the same animated group as the hands.
- Remove the favicon background in SVG, PNG, ICO and Apple icon; preserve the cloud/rain outline. All raster corner alpha values are zero; favicon cache version is now 5.
- Existing three tests, lint and production build pass; the same three pre-existing React warnings remain. Browser checked all 24 face choices, full-body Harry/Natasha previews, a two-player round and celebrating podium. At 320px the 24 buttons measure 54.25px square and the document has no horizontal overflow. No push, deployment or production configuration changes.

## Portrait chooser and named film leads (latest)

- The 24 choice buttons now contain cropped robot faces only, with no visible name captions. Accessible names/tooltips remain. The selected full-body preview shows the character's proper name and film. Desktop is six columns/four rows; narrow mobile uses four columns with touch targets above 44px.
- Replace Cooper's spacesuit with Cruella de Vil's two-tone hair/fur coat, Ripley with a robotic Xenomorph costume (elongated dome, jaw, ribbing and tail), and the racer with Jason Voorhees. Jason's hockey mask covers the whole face as requested.
- Paul Atreides has dark curls, blue eyes and a dark stillsuit; Luke Skywalker uses the black Return of the Jedi outfit with a green lightsaber. Refine Natasha Romanoff's red braid, Beatrix Kiddo's blonde hair/yellow collar, Jordan Belfort's slick hairstyle/suit, and the T-800's sunglasses/exposed red optic. All other labels now use the characters' names rather than generic archetypes.
- Portraits include a small costume collar, clipped to the face crop; full-body costumes and podium celebration remain. Selected identity keys and backend rules are unchanged.
- Favicon SVG now matches the header's Lucide CloudRain outline. Regenerated PNG/ICO fallbacks and the Apple icon, included the source license, and bumped URLs to v4. All five icon URLs return HTTP 200 with the expected image types.
- Three tests and build pass, with the same three pre-existing lint warnings. Browser checked 24 portrait buttons without captions, no duplicate SVG IDs/missing paints, live Cruella/Xenomorph/Luke selection, mobile 320px without horizontal overflow, and a full round through the final ceremony with Jason/Paul.

## Cosplay craft pass (latest)

- Rebuilt all 24 outfits as complete wardrobes: sleeves/cuffs, trousers, boots, tailored front panels, layered capes, equipment and distinctive headwear. The shared robot face and anatomy remain intact.
- Added local SVG materials for porcelain panels, glass/iris reflections, fabric, brushed steel and brass, plus knit and pinstripe patterns. Each robot instance receives unique paint IDs so portraits, preview and picker tiles never borrow each other's colors.
- Stronger film cues include Marty's quilted vest/denim/hoverboard, Danila's patterned knit/headphones/player, Jack's tricorn/braids/compass, Forrest's cap/chocolate box/feather, Thor's cape/winged headband/hammer, the Infinity Gauntlet's six stones, Widow's wristbands and tactical details, and the raised Spider-Man mask with a full webbed suit.
- Increased picker tiles and selected preview; occupied costumes stay visible with a readable occupied marker. The room settings panel no longer stretches to the full height of the outfit gallery.
- No server/session/scoring changes in this pass. Existing three tests pass; frontend lint retains only the original three warnings; build passes (about 108 KB gzip JS). No external image requests were added for the artwork.
- Browser verified all 24 choices, no unresolved SVG paint references or duplicate IDs, 320px layout without horizontal overflow, live character selection, and the new wardrobe on the celebrating podium. Test companion refreshed to keep S/A/B/C/D voting working after restarting a match.

## Shared chassis and 24 costumes (latest)

- A single simplified white-panel robot with stable head, face, eyes, limbs and proportions replaces the 16 unrelated silhouettes. Color changes its shell and joints; costumes sit on top as separate back/body/head/hand accessory layers. Masks are raised or open so the robot remains visible.
- Twenty-four choices cover Dune, Brother, Interstellar, Harry Potter, Lord of the Rings, Back to the Future, Fight Club, Forrest Gump, Terminator, Wolf of Wall Street, Matrix, Pirates of the Caribbean, Kill Bill, Rush, Alien, Star Wars and eight Avengers film characters (Spider-Man, Iron Man, Captain America, Thor, Hulk, Black Widow, Thanos and Loki).
- The first sixteen server identity keys remain unchanged; eight new keys extend selection. The player limit stays at 16. The server still enforces exclusive selection and reconnect ownership. Lobby includes a larger full-body preview and named full-body choice tiles.
- Poster proxy accepts only widths 185, 342 and 500, retaining default 500 for old clients. Responsive srcset/sizes chooses smaller files, fixed dimensions reserve layout, asynchronous decoding avoids blocking rendering. First visible/central poster receives high fetch priority. Each size has its own bounded 32 MiB shared LRU cache; concurrent requests for the same variant coalesce; upstream HTTPS connections are reused. Catalog filename validation and the 16-request concurrency cap remain.
- Local sample: u2kRTtD9YacSJH0tg9GZfrrKvMv.jpg was 22,819 bytes at 185, 64,672 at 342, and 123,599 at 500. This is one image, not a general latency guarantee. Browser confirmed main-menu requests at 185 and all five round posters at 342 on a 320px viewport.
- Tests cover 24 unique color keys, exclusive selection of a newly added key and recovery of that key on reconnect; poster tests cover allowed sizes, cache isolation, request coalescing and invalid filename/width rejection. All three tests pass; lint retains its three existing warnings; production build passes. Browser checked 24 choices and 320px layout with no horizontal overflow, full two-player round and the manual final ceremony.

## Cinema robot revision

- Replace all animal/face variants with sixteen distinct cinema-inspired robots: unique head geometry, visors, antennas, armor, hoods and equipment. Yellow is a desert robot inspired by Dune, green uses a Matrix visor, red a chest reactor, lime binocular optics.
- The UI palette now uses sixteen separate display colors. Existing server color keys remain unchanged for session/room compatibility; robot bodies, portraits and picker backgrounds consistently resolve to the new display palette. Two dark colors were lightened; all sixteen body colors have at least 3:1 contrast against the #171f35 card background. Silhouette and equipment remain additional identity cues; color alone cannot ensure distinction for every type of color vision.
- Full-body podium robots celebrate with staggered hops, arm gestures and moving shadows. Motion begins after the winners are revealed; prefers-reduced-motion disables these animations. The podium continues to wait for the user's table button.
- Tests and build pass with the same three existing React lint warnings. Live two-player round checked, yellow selection confirmed, display colors and actual changing arm transforms inspected in browser.

## Character and podium follow-up

- Sixteen vector characters replace the abstract symbols: four silhouettes with color and face/accessory variations. Lists use portraits, the podium uses full bodies standing on compact platforms. Existing color identity and server state remain unchanged.
- Used ranks are gray on other films but stay clickable. Transfer and swap use the existing server logic, with no changes to scoring or protocol.
- Replace gradient coins with SVG ribbon medals in the leaderboard; use large plain rank numbers on the podium itself.
- Remove the automatic leaderboard timeout. The ceremony stays until the player presses “Таблица всех игроков”.
- Twitch is a proposal only; see TWITCH_LOGIN_PLAN.md. No OAuth endpoints, keys or infrastructure changes added.

## Latest feedback pass

- Replace the wide reveal table with five film cards containing wrapping vertical player ballots, rank colors, match bonuses and averages. Round/total points stay in the roster.
- Gray out the other four rank controls after selecting a rank. Keep all rank controls aligned below full, untruncated movie titles.
- Restage the final ceremony with rising metallic podiums, crown accents, a soft stage light and replayable entrance. First/second/third competition ranks use gold/silver/bronze circular medals; other ranks use larger numbers. Equal scores retain equal ranks.
- Try the headline “Кино одно. Мнения разные.” locally. Character avatars remain a suggestion, not an implemented replacement for the current symbol set.
- Verified a full 16-player round: all five cards show 16 ballots; no horizontal overflow at 1100px or 320px; selected rank controls align exactly. Ceremony and automatic leaderboard transition checked with tied winners. Existing tests and build pass with the same three React lint warnings.

The local client implements the real game; it is not the old static prototype at port 4174. Preview the built frontend through the backend at http://localhost:4175 (`$env:PORT='4175'; npm start` in PowerShell after `npm run build`). No production deployment has been performed.

Approved constraints carried into this revision:
- Rain remains, without an on/off control. It pauses in hidden tabs and honors reduced motion.
- No prototype navigation, yellow brand dot, promotional filler or arrows on buttons.
- Ink navy with brighter periwinkle controls and distinct purple, blue, mint, amber and pink rank colors. Selected cards, rank buttons and reveal badges share the same rank color.
- Self-hosted variable Onest with Cyrillic coverage and OFL license; no external font dependency.
- Five unique random posters from the real catalog through GET /api/preview-movies. A new selection is made whenever the main menu mounts; this selection does not change the game deck.
- Sixteen Lucide symbols with consistent strokes tied to existing player colors, so no player/session schema migration is needed.
- Mobile round layout: one column and five rows. Each card has five equal-width rank buttons with no special final-card layout.
- All confirmations and alerts share a native modal dialog with keyboard focus containment, Escape cancellation, restored focus, scroll locking and the new visual treatment. Destructive actions use pink controls.
- Editable integer victory target (1–999), no stepper buttons.
- Real per-player 0/5 counts, overall readiness and host-controlled early reveal.
- Round reveal shows all players' ranks, each match bonus, average, round points and total points.
- Reaching the target stays on round reveal. The host action becomes "Итоги игры", then shows the animated podium followed by the complete leaderboard. Ties share a rank.
- Existing host transfer, kick, disconnect pause, reconnect and restart remain available.

Earlier local checks: two Socket.IO clients, typed target, complete matching ballots, 5/5 readiness, reveal before final ceremony, leaderboard, restart and reconnect. Integration tests cover the winning state transition and private state. This revision also verifies a two-player round, all five selected rank colors, equal rank-button widths, one-column layout at 390px, Onest loading, and dialog Escape cancellation. No push, deploy, paid service or production changes.

Additional responsive checks at 320px and 1440px passed. The narrow entry layout uses a shrinkable grid track; the symbol picker reduces its columns to prevent overlapping touch targets. The final frontend build passes. The existing three React lint warnings remain.

The archived original static prototype remains in frontend/prototype for reference. Use port 4175 for the current version.
