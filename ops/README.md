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

Future updates: fetch and check out a tested revision, build as `overrated`,
update the version in the systemd unit and restart `overrated`. Room persistence
uses the private state directory outside the Git checkout.
