#!/usr/bin/env bash

# Locate and source the host-owned sync/link config.
#
# The prototype package is host-agnostic: it must not name host files,
# host component customizations, or source-app env vars. All of that lives
# in a host-root config file owned by the consuming app.
#
# Resolution: PROTOTYPE_SYNC_CONFIG (env) > $HOST_ROOT/prototype.sync.config.sh
#
# See scripts/lib/host-config.example.sh for the expected shape.
load_host_config() {
  local host_root="$1"
  local config="${PROTOTYPE_SYNC_CONFIG:-$host_root/prototype.sync.config.sh}"

  if [[ ! -f "$config" ]]; then
    echo "Host sync config not found at: $config" >&2
    echo "Create it in the host repo root. Template:" >&2
    echo "  packages/prototype/scripts/lib/host-config.example.sh" >&2
    return 1
  fi

  # shellcheck disable=SC1090
  source "$config"
}
