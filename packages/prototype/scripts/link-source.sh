#!/usr/bin/env bash
set -euo pipefail

TOOL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/source-path.sh
source "$TOOL_ROOT/scripts/lib/source-path.sh"
HOST_ROOT="$(resolve_host_root "$TOOL_ROOT")"

LINK="$HOST_ROOT/source"
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  if ! TARGET="$(resolve_source_path "$HOST_ROOT")"; then
    echo "Set SOURCE_PATH in .env.local (see .env.example), or pass a path:" >&2
    echo "  pnpm link-source /path/to/source-app" >&2
    exit 1
  fi
elif [[ "$TARGET" != /* ]]; then
  TARGET="$HOST_ROOT/$TARGET"
fi

if [[ ! -d "$TARGET" ]]; then
  echo "Source app not found at: $TARGET" >&2
  exit 1
fi

if [[ -L "$LINK" ]]; then
  current="$(readlink "$LINK")"
  if [[ "$current" == "$TARGET" ]] || [[ "$(cd "$HOST_ROOT" && cd "$current" 2>/dev/null && pwd)" == "$TARGET" ]]; then
    echo "source/ already linked to: $TARGET"
    exit 0
  fi
  rm "$LINK"
elif [[ -e "$LINK" ]]; then
  echo "source/ exists but is not a symlink — remove it first" >&2
  exit 1
fi

ln -s "$TARGET" "$LINK"
echo "Linked source/ -> $TARGET"

node "$TOOL_ROOT/scripts/ensure-component-library-page.mjs"
