#!/usr/bin/env bash
# Start (or restart) the throwaway local Stalwart test instance.
#
#   bash ops/local-stalwart/start.sh [--keep]
#
# Default: wipes the old container + data volume for a clean run.
# --keep:  reuse the existing data volume (container is still recreated).
#
# After the container is up this script runs bootstrap.ts, which performs
# first-time setup through the recovery-mode management API and restarts
# the container into normal mode. Leaves the container running.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CONTAINER_NAME="${STALWART_CONTAINER_NAME:-stalwart-client-test}"
HTTP_PORT="${STALWART_HTTP_PORT:-18080}"
SMTP_PORT="${STALWART_SMTP_PORT:-10025}"
IMAP_PORT="${STALWART_IMAP_PORT:-10143}"
IMAGE="${STALWART_IMAGE:-docker.io/stalwartlabs/stalwart:latest}"
KEEP=0
if [[ "${1:-}" == "--keep" ]]; then KEEP=1; fi
export STALWART_KEEP="$KEEP"

# Runtime: podman preferred, fall back to docker.
if command -v podman >/dev/null 2>&1; then RT=podman
elif command -v docker >/dev/null 2>&1; then RT=docker
else echo "error: neither podman nor docker found" >&2; exit 1; fi

if ! command -v bun >/dev/null 2>&1; then
  echo "error: bun is required (bootstrap.ts)" >&2; exit 1
fi

# podman rootless needs an explicit keep-id mapping so the image's uid/gid
# 2000 can write the bind-mounted data dir; docker runs it natively.
USERNS_ARGS=()
if [[ "$RT" == "podman" ]]; then
  USERNS_ARGS=(--userns=keep-id:uid=2000,gid=2000)
fi

if [[ "$KEEP" -eq 0 ]]; then
  echo "==> wiping old container + data volume (fresh run)"
  "$RT" rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  rm -rf "$SCRIPT_DIR/data"
else
  echo "==> --keep: reusing existing data volume"
  "$RT" rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi
mkdir -p "$SCRIPT_DIR/data"

echo "==> starting $CONTAINER_NAME ($IMAGE) in recovery mode for bootstrap"
# Recovery mode exposes only the management HTTP API on 8080 and provisions
# a temporary admin (STALWART_RECOVERY_ADMIN) we bootstrap from. The strong
# random password avoids clashing with the real admin created later.
RECOVERY_PASSWORD="rcv-$(head -c 18 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24)"
export STALWART_RECOVERY_ADMIN="admin:${RECOVERY_PASSWORD}"
"$RT" run -d --name "$CONTAINER_NAME" \
  "${USERNS_ARGS[@]}" \
  -e "STALWART_RECOVERY_MODE=1" \
  -e "STALWART_RECOVERY_ADMIN=admin:${RECOVERY_PASSWORD}" \
  -p "127.0.0.1:${HTTP_PORT}:8080" \
  -p "127.0.0.1:${SMTP_PORT}:25" \
  -p "127.0.0.1:${IMAP_PORT}:143" \
  -v "$SCRIPT_DIR/config.json:/etc/stalwart/config.json:ro" \
  -v "$SCRIPT_DIR/data:/var/lib/stalwart" \
  "$IMAGE" >/dev/null

export STALWART_RT="$RT"
export STALWART_CONTAINER_NAME="$CONTAINER_NAME"
export STALWART_IMAGE="$IMAGE"
export STALWART_HTTP_PORT="$HTTP_PORT"
export STALWART_SMTP_PORT="$SMTP_PORT"
export STALWART_IMAP_PORT="$IMAP_PORT"
export STALWART_OPS_DIR="$SCRIPT_DIR"
export STALWART_BASE_URL="http://127.0.0.1:${HTTP_PORT}"
export STALWART_RECOVERY_PASSWORD="$RECOVERY_PASSWORD"

if [[ "$KEEP" -eq 1 ]]; then
  echo "==> running bootstrap.ts --keep (reuse existing data)"
  bun "$SCRIPT_DIR/bootstrap.ts" --keep
else
  echo "==> running bootstrap.ts"
  bun "$SCRIPT_DIR/bootstrap.ts"
fi

echo ""
echo "==> local Stalwart is up: $STALWART_BASE_URL (container: $CONTAINER_NAME)"
echo "    credentials: ops/local-stalwart/.env.local"
