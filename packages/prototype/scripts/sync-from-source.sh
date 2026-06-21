#!/usr/bin/env bash
set -euo pipefail

TOOL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/source-path.sh
source "$TOOL_ROOT/scripts/lib/source-path.sh"
# shellcheck source=lib/host-config.sh
source "$TOOL_ROOT/scripts/lib/host-config.sh"
HOST_ROOT="$(resolve_host_root "$TOOL_ROOT")"

if ! load_host_config "$HOST_ROOT"; then
  exit 1
fi

if ! SOURCE="$(resolve_source_path "$HOST_ROOT")"; then
  echo "Source app path not found." >&2
  echo "Set SOURCE_PATH in .env.local (see .env.example), run pnpm link-source, or pass SOURCE=/path/to/source-app" >&2
  exit 1
fi

echo "Syncing from $SOURCE"

copy_file() {
  local rel="$1"
  mkdir -p "$HOST_ROOT/$(dirname "$rel")"
  cp "$SOURCE/$rel" "$HOST_ROOT/$rel"
}

copy_dir() {
  local rel="$1"
  mkdir -p "$HOST_ROOT/$rel"
  cp -R "$SOURCE/$rel/." "$HOST_ROOT/$rel/"
}

copy_glob() {
  local glob="$1" dest matches
  dest="$(dirname "$glob")"
  mkdir -p "$HOST_ROOT/$dest"
  # shellcheck disable=SC2206
  matches=( "$SOURCE"/$glob )
  if [[ -e "${matches[0]}" ]]; then
    cp "${matches[@]}" "$HOST_ROOT/$dest/"
  fi
}

for rel in ${SYNC_FILES[@]+"${SYNC_FILES[@]}"}; do
  copy_file "$rel"
done
for rel in ${SYNC_DIRS[@]+"${SYNC_DIRS[@]}"}; do
  copy_dir "$rel"
done
for glob in ${SYNC_GLOBS[@]+"${SYNC_GLOBS[@]}"}; do
  copy_glob "$glob"
done

# Re-apply platform Tailwind source scan (package self-reference; not in source app).
if ! grep -q '@source "../../packages/prototype' "$HOST_ROOT/src/app/globals.css"; then
  if [[ "$OSTYPE" == darwin* ]]; then
    sed -i '' '/^@import "tailwindcss";/a\
@source "../../packages/prototype/src/**/*.{js,ts,jsx,tsx}";
' "$HOST_ROOT/src/app/globals.css"
  else
    sed -i '/^@import "tailwindcss";/a @source "../../packages/prototype/src/**/*.{js,ts,jsx,tsx}";' "$HOST_ROOT/src/app/globals.css"
  fi
fi

if [[ "${SYNC_LOCAL_EXTENSIONS+set}" == set && "${#SYNC_LOCAL_EXTENSIONS[@]}" -gt 0 ]]; then
  echo "Done. Re-apply local extensions:"
  for ext in "${SYNC_LOCAL_EXTENSIONS[@]}"; do
    echo "  - $ext"
  done
else
  echo "Done."
fi
