# OVERRATED

Multiplayer film-ranking game for 2–16 players. React/Vite frontend, Express/Socket.IO backend.

## Development

Use Node 22 (at least 22.12). Run `npm run build`, then `npm start` for the production build on port 3001. For development run `npm --prefix backend run dev` and `npm --prefix frontend run dev` in separate terminals. Vite proxies Socket.IO and `/api` to the backend.

`npm run check` runs socket integration tests, lint and frontend build. Tests use port 3099 and never contact production.

## Deployment

Render builds with `npm run build` and starts with `npm start`. Configure the HTTP health check as `/healthz`. Both health routes return 503 if the catalog or frontend build is missing. A commit pushed to `main` automatically deploys.

The 29 film characters use local SVG drawings in `frontend/src/components/characters`.
`shared/player-identities.json` defines the server/client selection order and stable
color keys. The original 24 keys are retained; the removed Cruella, Xenomorph and
Gandalf slots now show Vader, Batman and Joker. Five new slots extend the list.
Portraits are static; full characters have individual idle and victory motion,
including Bateman's normal/sigma loop. Reduced-motion preferences are respected.
The local workshop and its revision backups are separate from the production entry.

Sessions use server-generated secrets and stable player IDs. Only a player's own ranks are sent before reveal. A reconnect from a second tab replaces the first. Nicknames alone cannot restore a session. Invitations use `?room=ABC123`.

## Persistence and operations

By default rooms live in memory. For persistence set `ROOM_STATE_FILE` to a private path on a **persistent disk**, such as `/var/data/overrated/rooms.json`. Snapshots contain session secrets: never publish or commit them. Writes use atomic rename. Rooms resume paused with players offline; sessions idle for over 30 minutes are discarded on restore. Graceful shutdown saves state. An abrupt crash may lose the last debounced update.

Render Free has no persistent disk. Setting a path on its ephemeral filesystem does **not** preserve rooms across deployments. Provision persistent storage before promising restart recovery. No paid infrastructure is created by this repository.

Cron can request `/healthz` every 10 minutes. It does not prevent restarts or restore rooms, and Free hours are shared by the workspace. Use `/api/health` for uptime and deployed commit. Server logs identify poster and event failures.

## Catalog maintenance

`backend/movies.json` is the versioned catalog. `node backend/fetch_all_movies.js` imports all source sheets, aborting if any fail. Review its diff before accepting it. `node backend/update_posters_tmdb.js` requires `TMDB_API_KEY`; review poster matches manually. Both commands modify the catalog and are not run during build.

An old TMDB credential was previously committed. It must be revoked/replaced in the TMDB account; removing it from current code does not revoke it or erase Git history.

The UI has no advertising, partner links or advertising scripts. Fonts are loaded once from Google Fonts, with system fallbacks. Poster failure uses a local SVG placeholder.
