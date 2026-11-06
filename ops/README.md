# FirstByte deployment

`firstbyte-bootstrap.sh` provisions the paid Ubuntu VPS with the existing production
revision, Node.js 22 (official archive with SHA-256 verification), nginx, certbot,
an unprivileged systemd service, and a firewall permitting SSH/HTTP/HTTPS.
It does not change DNS or stop Render. Run it only on the intended new server.

Application: `/opt/overrated/app`; service: `overrated`; private room snapshots:
`/var/lib/overrated/rooms.json`. Logs: `journalctl -u overrated`.
The snapshot contains session credentials and must not be published or committed.
Inactive snapshots older than 30 minutes are not restored by the application.

After checking HTTP, Socket.IO and posters, point the apex A record at the VPS,
make `www` a CNAME to the apex, and issue HTTPS using certbot's nginx plugin.
Keep the previous DNS values and Render service available for rollback.
Do not publish an AAAA record until IPv6 reachability has been verified.

On this Moscow VPS, direct TMDB image requests failed. `firstbyte-posters.cjs`
copies the existing catalog's images from the old origin once and creates the
185/342/500 variants in `/var/cache/overrated-posters`. nginx serves them directly;
normal gameplay does not contact Render or TMDB for these posters. Run the
preloader with `sharp` installed in `/opt/overrated-tools`; reruns skip complete
files. Future catalog additions must include their local poster files too.

`firstbyte-smoke.cjs` checks the actual nginx endpoint, three-player gameplay,
history and a real `systemctl restart` with session restoration. Run it only
before admitting players because it restarts the service.
`firstbyte-finalize.cjs` adds the canonical www redirect and checks HTTPS and
Socket.IO with certificate verification enabled. Its diagnostic DNS override
applies only to its own HTTPS agent; it does not modify system DNS or VPN.

Migration target: `185.17.0.153`, domain `overratedkino.ru`, www CNAME to the apex.
Previous apex A: `151.236.109.225`; previous www CNAME: `kino-igra.onrender.com.`.
The old `_acme-challenge` CNAME to `_acme-challenge.cdnabtv.net.` is no longer
needed because this VPS uses nginx HTTP validation and automated certbot renewal.
Render remains available as a rollback copy. Existing in-memory Render rooms are
not imported; create a new room after moving to the VPS.

Future updates: fetch and check out a tested revision, build as `overrated`,
update the version in the systemd unit and restart `overrated`. Room persistence
uses the private state directory outside the Git checkout.
