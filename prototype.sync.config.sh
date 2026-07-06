#!/usr/bin/env bash
#
# Host-owned sync/link config for proto-prototypes (cal.diy source).

# --- pnpm sync-from-source -------------------------------------------------

SYNC_FILES=(
  "apps/web/styles/globals.css"
  "apps/web/styles/raqb.css"
)

SYNC_DIRS=(
  "packages/coss-ui"
  "packages/ui"
  "packages/config/theme"
  "apps/web/components/ui"
  "apps/web/fonts"
  "apps/web/public/fonts"
  "apps/web/public/icons"
)

SYNC_GLOBS=(
)

SYNC_LOCAL_EXTENSIONS=(
  "src/app/globals.css (keep @source lines; import tw-animate-css/plugins from host; use src/app/cal-tokens.css instead of packages/config/theme/tokens.css)"
  "src/app/cal-tokens.css (host copy of tokens.css without plugin imports — regenerate from source after sync if tokens change)"
  "packages/ui/components/icon/IconSprites.tsx (use empty base URL fallback for local /icons/sprite.svg)"
  "packages/ui/package.json (remove @calcom/config and @calcom/tsconfig devDependencies)"
)

# --- pnpm link-source-db ---------------------------------------------------

SOURCE_DB_ENV_VARS=(
)

SOURCE_DB_CONSOLE_URL=""
