#!/usr/bin/env bash
#
# Host-owned sync/link config (TEMPLATE).
#
# Copy this to the host repo root as `prototype.sync.config.sh` and fill in
# the values for YOUR app. The prototype package reads this file so that no
# host-specific file names, component customizations, or source-app env var
# names ever live inside the package itself.
#
# All paths are relative to the repo root and are mirrored 1:1 between the
# source app and this host (e.g. source `src/lib/utils.ts` -> host
# `src/lib/utils.ts`).

# --- pnpm sync-from-source -------------------------------------------------

# Single files to copy from the source app into this host.
SYNC_FILES=(
  "src/app/globals.css"
  # "src/lib/utils.ts"
)

# Directories to copy recursively (contents merged into the host dir).
SYNC_DIRS=(
  # "src/components/ui"
)

# Globs to copy (each glob's parent dir is the destination).
SYNC_GLOBS=(
  # "public/fonts/*.woff2"
)

# Reminder list printed after a sync: files this host has customized beyond
# the source version, which the blanket copy overwrites and you must re-apply.
# Leave empty if the host does not diverge from source.
SYNC_LOCAL_EXTENSIONS=(
  # "src/app/globals.css (keep @source line; tool theme lives in layout via proto-plugin/styles/globals.css)"
)

# --- pnpm link-source-db ---------------------------------------------------

# Env var names to copy from the source app's .env.local into this host's.
SOURCE_DB_ENV_VARS=(
  # "MY_SERVICE_URL"
  # "MY_SERVICE_KEY"
)

# Optional: console URL printed after a successful link.
SOURCE_DB_CONSOLE_URL=""
