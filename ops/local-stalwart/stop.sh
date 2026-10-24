#!/usr/bin/env bash
# Stop and remove the local Stalwart test container. Data volume is kept;
# run start.sh without --keep for a fully clean run.
set -euo pipefail

CONTAINER_NAME="${STALWART_CONTAINER_NAME:-stalwart-client-test}"

if command -v podman >/dev/null 2>&1; then RT=podman
elif command -v docker >/dev/null 2>&1; then RT=docker
else echo "error: neither podman nor docker found" >&2; exit 1; fi

"$RT" rm -f "$CONTAINER_NAME" >/dev/null 2>&1 \
  && echo "stopped + removed $CONTAINER_NAME" \
  || echo "$CONTAINER_NAME was not running"
