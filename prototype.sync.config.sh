#!/usr/bin/env bash
#
# Host-owned sync/link config for proto-prototypes.

# --- pnpm sync-from-source -------------------------------------------------

SYNC_FILES=(
  "src/app/globals.css"
)

SYNC_DIRS=(
)

SYNC_GLOBS=(
)

SYNC_LOCAL_EXTENSIONS=(
  "src/app/globals.css (keep @source + self-referential @theme colors; product tokens as --product-* on [data-prototype-screenshot] — not --color-* on :root)"
)

# --- pnpm link-source-db ---------------------------------------------------

SOURCE_DB_ENV_VARS=(
)

SOURCE_DB_CONSOLE_URL=""
