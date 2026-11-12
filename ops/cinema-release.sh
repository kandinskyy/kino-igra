#!/usr/bin/env bash
# Run as root on the existing VPS. Only the application checkout/service are updated.
set -Eeuo pipefail
revision="${1:?Pass the tested 40-character commit SHA}"
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || exit 2
app=/opt/overrated/app
[[ -d "$app/.git" ]] || { echo 'Unexpected application path'; exit 2; }
cd "$app"
[[ -z "$(runuser -u overrated -- git status --porcelain)" ]] || { echo 'Checkout has local changes; refusing overwrite'; exit 3; }
previous=$(runuser -u overrated -- git rev-parse HEAD)
backup="/opt/overrated/release-backups/$(date -u +%Y%m%dT%H%M%SZ)-${previous:0:8}"
install -d -m 700 "$backup"
printf '%s\n' "$previous" > "$backup/previous-revision"
[[ -d frontend/dist ]] && cp -a frontend/dist "$backup/dist"
dropin=/etc/systemd/system/overrated.service.d/90-cinema-release.conf
[[ ! -f "$dropin" ]] || cp -a "$dropin" "$backup/version.conf"
changed=0
rollback() {
 code=$?
 trap - ERR
 set +e
 restore_failed=0
 if [[ "$changed" == 1 ]]; then
  runuser -u overrated -- git checkout --detach "$previous" || restore_failed=1
  [[ ! -d "$app/frontend/.cinema-next" ]] || mv "$app/frontend/.cinema-next" "$backup/failed-stage" || restore_failed=1
  if [[ -d "$backup/dist" ]]; then
   [[ ! -d frontend/dist ]] || mv frontend/dist "$backup/failed-dist" || restore_failed=1
   cp -a "$backup/dist" frontend/dist || restore_failed=1
  fi
  if [[ -f "$backup/version.conf" ]]; then cp -a "$backup/version.conf" "$dropin" || restore_failed=1; else rm -f "$dropin" || restore_failed=1; fi
  systemctl daemon-reload || restore_failed=1
  systemctl restart overrated || restore_failed=1
 fi
 if [[ "$restore_failed" == 0 ]]; then echo "Release failed; previous application restored. Backup: $backup"; else echo "RESTORE_FAILED: manual recovery required. Backup: $backup"; fi
 exit "$code"
}
trap rollback ERR
runuser -u overrated -- git fetch origin
runuser -u overrated -- git cat-file -e "$revision^{commit}"
changed=1
runuser -u overrated -- git checkout --detach "$revision"
runuser -u overrated -- npm --prefix frontend ci
runuser -u overrated -- npm --prefix frontend run build -- --outDir .cinema-next
for asset in cinema-clean entrance-door-restored-v3 cinema-ticket-vestibule lobby-door-restored lobby-auditorium-seats-v2; do
 test -s "frontend/.cinema-next/prototype/cinema-entrance/assets/$asset.png"
done
test -s frontend/.cinema-next/prototype/night-club/assets/cinema-foyer.png
test -s frontend/.cinema-next/prototype/full-cinema/assets/spiral-portal.png
test -s frontend/.cinema-next/prototype/night-club/assets/Oswald.ttf
test -s frontend/.cinema-next/index.html
[[ ! -d frontend/dist/assets ]] || cp -an frontend/dist/assets/. frontend/.cinema-next/assets/
[[ ! -d frontend/dist ]] || mv frontend/dist "$backup/previous-live-dist"
mv frontend/.cinema-next frontend/dist
install -d /etc/systemd/system/overrated.service.d
printf '[Service]\nEnvironment=RENDER_GIT_COMMIT=%s\n' "$revision" > "$dropin"
systemctl daemon-reload
systemctl restart overrated
for attempt in {1..20}; do
 if curl -fsS http://127.0.0.1:3001/api/health > "$backup/health.json"; then break; fi
 sleep 1
done
node -e 'const h=require(process.argv[1]);if(h.status!=="ok"||h.version!==process.argv[2])process.exit(1)' "$backup/health.json" "$revision"
systemctl is-active --quiet overrated
trap - ERR
echo "RELEASE_OK $revision BACKUP=$backup"
