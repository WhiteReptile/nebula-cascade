#!/usr/bin/env bash
# Keep YourTruths on :3000 and the named Cloudflare tunnel alive.
# Does not print secrets. Token comes from .env.local CLOUDFLARE_TUNNEL_TOKEN.

set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
LOG_DIR="$ROOT/data"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/keep-up.log"

log() { echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") $*" >>"$LOG"; }

load_env() {
  if [ -f "$ROOT/.env.local" ]; then
    set -a
    # shellcheck disable=SC1091
    . "$ROOT/.env.local"
    set +a
  fi
}

site_up() {
  curl -sf -o /dev/null --max-time 5 "http://127.0.0.1:3000/"
}

kill_quick_tunnels() {
  pkill -f "/tmp/cloudflared tunnel --url" 2>/dev/null || true
  pkill -f "cloudflared tunnel --url" 2>/dev/null || true
}

named_tunnel_up() {
  pgrep -f "cloudflared tunnel --no-autoupdate run --token" >/dev/null 2>&1
}

start_named_tunnel() {
  load_env
  if [ -z "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]; then
    log "no CLOUDFLARE_TUNNEL_TOKEN; skip tunnel start"
    return 1
  fi
  if named_tunnel_up; then return 0; fi
  log "starting named tunnel"
  nohup /tmp/cloudflared tunnel --no-autoupdate run --token "$CLOUDFLARE_TUNNEL_TOKEN" \
    >>"$LOG_DIR/cloudflared.log" 2>&1 &
}

start_next() {
  if site_up; then return 0; fi
  if [ ! -f "$ROOT/.next/BUILD_ID" ]; then
    log "building Next.js"
    npm run build >>"$LOG_DIR/next-build.log" 2>&1 || {
      log "build failed"
      return 1
    }
  fi
  log "starting next start"
  HOSTNAME=0.0.0.0 PORT=3000 nohup npm run start >>"$LOG_DIR/next-start.log" 2>&1 &
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    site_up && return 0
    sleep 1
  done
  log "next start did not become ready"
  return 1
}

kill_quick_tunnels
load_env
if site_up; then
  log "next already answering on :3000"
else
  start_next || true
fi
start_named_tunnel || true

while true; do
  kill_quick_tunnels
  if ! site_up; then
    log "site down; restarting next"
    start_next || true
  fi
  if ! named_tunnel_up; then
    log "named tunnel down; restarting"
    start_named_tunnel || true
  fi
  sleep 20
done
