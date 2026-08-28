#!/usr/bin/env bash
#
# Host-owned sync/link config for proto-prototypes (Supabase Studio source).
# Bundled packages/ui, packages/ui-patterns, and packages/config are host-local —
# sync styles to src/styles/supabase-product/ instead (see product-tokens.css).

# --- pnpm sync-from-source -------------------------------------------------

SYNC_FILES=(
)

SYNC_DIRS=(
  "packages/common"
  "packages/icons"
  "packages/api-types"
  "packages/tsconfig"
  "packages/build-icons"
  "apps/studio/fonts"
)

SYNC_GLOBS=(
)

SYNC_LOCAL_EXTENSIONS=(
  "src/app/layout.tsx (html.light + Supabase fonts)"
  "src/app/supabase-product-surface.css (clear proto-plugin gray pin; inherit html.light tokens)"
  "src/app/supabase-product-theme.tsx (pins data-theme=light on prototype viewport)"
  "src/app/layout.tsx (host fonts from apps/studio/fonts via next/font)"
  "src/app/providers.tsx (TooltipProvider from synced ui package)"
  "src/app/design-system/design-system-content.tsx (component previews + generated tokens)"
  "src/app/globals.css (keep packages/config @imports; append src/styles/supabase-product/)"
  "src/styles/supabase-product/ (re-copy from source after sync)"
  "package.json (workspace deps ui/ui-patterns/common; cal.com packages for legacy prototypes)"
  "pnpm-workspace.yaml (catalog entries for synced package catalog: refs)"
)

# --- pnpm link-source-db ---------------------------------------------------

SOURCE_DB_ENV_VARS=(
)

SOURCE_DB_CONSOLE_URL=""
