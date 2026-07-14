#!/usr/bin/env bash

# Walk up from the plugin root until we find prototype.config.ts (host repo root).
resolve_host_root() {
  local tool_root="$1"
  local dir

  dir="$(cd "$tool_root/.." && pwd)"
  while [[ "$dir" != "/" ]]; do
    if [[ -f "$dir/prototype.config.ts" ]]; then
      printf '%s' "$dir"
      return 0
    fi
    dir="$(dirname "$dir")"
  done

  # Fallback for the standard workspace layout: host/packages/prototype
  (cd "$tool_root/../.." && pwd)
}

# Resolve source app path: SOURCE (shell) > SOURCE_PATH (env) > .env.local > source/ symlink
resolve_source_path() {
  local root="$1"
  local raw="${SOURCE:-${SOURCE_PATH:-}}"

  if [[ -z "$raw" && -f "$root/.env.local" ]]; then
    raw="$(
      grep -E '^SOURCE_PATH=' "$root/.env.local" | tail -1 | cut -d= -f2- \
        | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' \
              -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
    )"
  fi

  if [[ -z "$raw" && -L "$root/source" ]]; then
    raw="$(readlink "$root/source")"
  fi

  if [[ -z "$raw" ]]; then
    return 1
  fi

  raw="${raw/#\~/$HOME}"

  if [[ "$raw" != /* ]]; then
    raw="$root/$raw"
  fi

  (cd "$raw" 2>/dev/null && pwd) || return 1
}
