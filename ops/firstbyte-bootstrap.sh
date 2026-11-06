#!/usr/bin/env bash
# Run as root on the new Ubuntu VPS. Does not change DNS or the Render service.
set -euo pipefail
umask 022
REVISION=046cb7fda3f5d0823721d7a23ee657e55e55777d
APP=/opt/overrated/app
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git nginx certbot python3-certbot-nginx ufw xz-utils
TEMP=$(mktemp -d)
trap 'rm -rf "$TEMP"' EXIT
cd "$TEMP"
curl -4 --retry 3 --max-time 60 -fsS https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt -o SHASUMS256.txt
ARCHIVE=$(awk '/ linux-x64.tar.xz$/ {print $2}' SHASUMS256.txt)
# Node filenames contain the version before linux-x64.
if [ -z "$ARCHIVE" ]; then ARCHIVE=$(awk '/-linux-x64.tar.xz$/ {print $2}' SHASUMS256.txt); fi
test -n "$ARCHIVE"
curl -4 --retry 3 --max-time 180 -fsS "https://nodejs.org/dist/latest-v22.x/$ARCHIVE" -o "$ARCHIVE"
grep "  $ARCHIVE\$" SHASUMS256.txt | sha256sum -c -
tar -xJf "$ARCHIVE" -C /opt
NODE_DIR=/opt/${ARCHIVE%.tar.xz}
for command in node npm npx; do ln -sfn "$NODE_DIR/bin/$command" "/usr/local/bin/$command"; done
node --version
id overrated >/dev/null 2>&1 || useradd --system --create-home --home-dir /opt/overrated --shell /usr/sbin/nologin overrated
if [ ! -d "$APP/.git" ]; then
  runuser -u overrated -- git clone https://github.com/kandinskyy/kino-igra.git "$APP"
fi
runuser -u overrated -- git -C "$APP" fetch origin
runuser -u overrated -- git -C "$APP" checkout --detach "$REVISION"
cd "$APP"
runuser -u overrated -- env PATH=/usr/local/bin:/usr/bin:/bin npm run build
cat >/etc/systemd/system/overrated.service <<EOF
[Unit]
Description=OVERRATED game server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=overrated
Group=overrated
WorkingDirectory=$APP
ExecStart=/usr/local/bin/node $APP/backend/server.js
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=ROOM_STATE_FILE=/var/lib/overrated/rooms.json
Environment=RENDER_GIT_COMMIT=$REVISION
StateDirectory=overrated
StateDirectoryMode=0700
UMask=0077
Restart=on-failure
RestartSec=3
TimeoutStopSec=15
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/var/lib/overrated
MemoryMax=768M

[Install]
WantedBy=multi-user.target
EOF
cat >/etc/nginx/sites-available/overrated <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name overratedkino.ru www.overratedkino.ru;
    client_max_body_size 64k;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 90s;
        proxy_send_timeout 90s;
        proxy_buffering off;
    }
}
EOF
if [ -e /etc/nginx/sites-enabled/default ]; then mv /etc/nginx/sites-enabled/default /etc/nginx/default-site.disabled; fi
ln -sfn /etc/nginx/sites-available/overrated /etc/nginx/sites-enabled/overrated
nginx -t
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
systemctl daemon-reload
systemctl enable --now overrated nginx
systemctl reload nginx
curl --fail --retry 10 --retry-connrefused --retry-delay 1 http://127.0.0.1/api/health
printf '\nFIRSTBYTE_APP_READY\n'
