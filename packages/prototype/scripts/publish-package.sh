#!/usr/bin/env bash
set -euo pipefail

TOOL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$TOOL_ROOT"

REGISTRY="https://npm.pkg.github.com"
DRY_RUN=0
TAG="latest"
SKIP_VERIFY=0

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Publish @maayanalbert/prototype privately to GitHub Packages.

Options:
  --dry-run        Validate the tarball without publishing
  --tag <tag>      npm dist-tag (default: latest)
  --skip-verify    Skip pre-publish verification scripts
  -h, --help       Show this help message

Examples:
  pnpm publish-package
  pnpm publish-package --dry-run
  pnpm publish-package --tag next

Requires: gh auth login (read:packages + write:packages) or GITHUB_TOKEN.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --tag)
      TAG="${2:?Missing value for --tag}"
      shift 2
      ;;
    --skip-verify)
      SKIP_VERIFY=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ "$(node -pe "require('./package.json').private === true")" == "true" ]]; then
  echo "package.json has \"private\": true, which blocks npm publish." >&2
  echo "Remove it or set \"private\": false before publishing." >&2
  exit 1
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    GITHUB_TOKEN="$(gh auth token)"
  else
    echo "Set GITHUB_TOKEN or run: gh auth login" >&2
    exit 1
  fi
fi

export GITHUB_TOKEN

find_host_with_prototypes() {
  local dir="$TOOL_ROOT/.."
  while [[ "$dir" != "/" ]]; do
    if [[ -f "$dir/prototype.config.ts" && -d "$dir/src/prototypes" ]]; then
      echo "$dir"
      return 0
    fi
    dir="$(dirname "$dir")"
  done
  return 1
}

if [[ "$SKIP_VERIFY" -eq 0 ]]; then
  if host_root="$(find_host_with_prototypes)"; then
    echo "Running verification scripts against $host_root..."
    npm run verify:prototype-ids
    npm run verify:prototype-preview-states
  else
    echo "Skipping verification (no host app with prototypes found)."
  fi
fi

PACKAGE_NAME="$(node -pe "require('./package.json').name")"
PACKAGE_VERSION="$(node -pe "require('./package.json').version")"

echo "Publishing ${PACKAGE_NAME}@${PACKAGE_VERSION}"
echo "Registry: ${REGISTRY}"
echo "Access: private (GitHub Packages)"

NPM_CONFIG_USERCONFIG="$(mktemp)"
trap 'rm -f "$NPM_CONFIG_USERCONFIG"' EXIT

cat >"$NPM_CONFIG_USERCONFIG" <<EOF
@maayanalbert:registry=${REGISTRY}/
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
EOF

PUBLISH_ARGS=(--registry "$REGISTRY" --tag "$TAG")

if [[ "$DRY_RUN" -eq 1 ]]; then
  PUBLISH_ARGS+=(--dry-run)
  echo "Dry run — tarball will not be uploaded."
fi

# Bypass org Socket Firewall npm proxy for GitHub Packages.
env -u NPM_CONFIG_REGISTRY -u NPM_CONFIG_CAFILE \
  NPM_CONFIG_USERCONFIG="$NPM_CONFIG_USERCONFIG" \
  npm publish "${PUBLISH_ARGS[@]}"

if [[ "$DRY_RUN" -eq 0 ]]; then
  echo "Published successfully."
  echo "Install with:"
  echo "  npm install ${PACKAGE_NAME}@${PACKAGE_VERSION}"
  echo "Add to .npmrc in consuming repos:"
  echo "  @maayanalbert:registry=${REGISTRY}/"
  echo "  //npm.pkg.github.com/:_authToken=<GITHUB_TOKEN>"
fi
