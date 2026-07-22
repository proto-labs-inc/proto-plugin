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
#
# Neutral hosts that ship Supabase examples often list:
#   src/prototypes/table-editor-filters/table-editor-filters-theme.css
#   src/app/globals.css (keep Supabase @imports; append product token imports)
SYNC_LOCAL_EXTENSIONS=(
  # "src/app/globals.css (keep @source line; tool theme lives in layout via proto-plugin/styles/globals.css)"
)

# --- pnpm verify:component-library (coverage oracle) ------------------------
#
# The component-library gate enumerates the synced design-system directories and
# fails until every primitive/composite is previewed on /component-library (or
# has a `// skip: <Name> - <reason>` comment). By default it derives the roots
# from the component-looking entries in SYNC_DIRS above (paths under ui/shadcn
# for primitives, paths matching "pattern" for composites; lib/utils/hooks/
# styles are ignored).
#
# Set these ONLY when the heuristic picks the wrong dirs (e.g. an app has both an
# app-chrome `components/ui` and a design-system `shadcn/ui`). Paths are relative
# to the host repo root and point at the synced-in directories.
COMPONENT_LIBRARY_PRIMITIVE_ROOTS=(
  # "packages/ui/src/components/shadcn/ui"
)
COMPONENT_LIBRARY_COMPOSITE_ROOTS=(
  # "packages/ui-patterns/src"
)

# --- pnpm link-source-db ---------------------------------------------------

# Env var names to copy from the source app's .env.local into this host's.
SOURCE_DB_ENV_VARS=(
  # "MY_SERVICE_URL"
  # "MY_SERVICE_KEY"
)

# Optional: console URL printed after a successful link.
SOURCE_DB_CONSOLE_URL=""
