#!/usr/bin/env bash
set -euo pipefail

TOOL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$TOOL_ROOT"

REGISTRY="https://registry.npmjs.org"
DRY_RUN=0
TAG="latest"
SKIP_VERIFY=0
SKIP_BUMP=0
BUMP="patch"
OTP=""

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Publish proto-plugin to npm.

Options:
  --dry-run        Validate the tarball without publishing
  --tag <tag>      npm dist-tag (default: latest)
  --otp <code>     One-time password from your authenticator app
  --skip-verify    Skip pre-publish verification scripts
  --no-bump        Publish package.json version as-is (fail if already published)
  --bump <level>   Bump level when current version exists on npm: patch, minor, major (default: patch)
  -h, --help       Show this help message

Examples:
  pnpm publish-package
  pnpm publish-package --otp 123456
  pnpm publish-package --dry-run
  pnpm publish-package --tag next

Requires: npm login (npm whoami must succeed).
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
    --no-bump)
      SKIP_BUMP=1
      shift
      ;;
    --bump)
      BUMP="${2:?Missing value for --bump}"
      case "$BUMP" in
        patch | minor | major) ;;
        *)
          echo "Invalid --bump value: $BUMP (expected patch, minor, or major)" >&2
          exit 1
          ;;
      esac
      shift 2
      ;;
    --otp)
      OTP="${2:?Missing value for --otp}"
      shift 2
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

if ! npm whoami --registry "$REGISTRY" >/dev/null 2>&1; then
  echo "Not logged in to npm. Run: npm login" >&2
  exit 1
fi

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

version_is_published() {
  npm view "${PACKAGE_NAME}@${1}" version --registry "$REGISTRY" >/dev/null 2>&1
}

ensure_unpublished_version() {
  local bump_level="$1"
  while version_is_published "$(node -pe "require('./package.json').version")"; do
    local current
    current="$(node -pe "require('./package.json').version")"
    echo "Version ${current} is already on npm; bumping ${bump_level}..."
    npm version "$bump_level" --no-git-tag-version
  done
}

if [[ "$SKIP_BUMP" -eq 0 ]]; then
  ensure_unpublished_version "$BUMP"
  PACKAGE_VERSION="$(node -pe "require('./package.json').version")"
fi

echo "Publishing ${PACKAGE_NAME}@${PACKAGE_VERSION}"
echo "Registry: ${REGISTRY}"
echo "Access: public (unscoped)"

PUBLISH_ARGS=(--registry "$REGISTRY" --tag "$TAG")

if [[ -n "$OTP" ]]; then
  PUBLISH_ARGS+=(--otp "$OTP")
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  PUBLISH_ARGS+=(--dry-run)
  echo "Dry run — tarball will not be uploaded."
fi

env -u NPM_CONFIG_REGISTRY -u NPM_CONFIG_CAFILE \
  npm publish "${PUBLISH_ARGS[@]}" || {
  status=$?
  if [[ "$DRY_RUN" -eq 0 && "$status" -ne 0 ]]; then
    echo >&2
    echo "Publish failed." >&2
    if [[ "$PACKAGE_NAME" == @*/* ]]; then
      scope="${PACKAGE_NAME%%/*}"
      scope="${scope#@}"
      whoami="$(npm whoami --registry "$REGISTRY" 2>/dev/null || true)"
      echo "Logged in as: ${whoami:-unknown}" >&2
      echo "Package scope: @${scope}" >&2
      if [[ -n "$whoami" && "$whoami" != "$scope" ]]; then
        echo >&2
        echo "npm often returns 404 when your account cannot publish to this scope." >&2
        echo "Fix one of:" >&2
        echo "  1. npm logout && npm login   # sign in as the @${scope} npm user/org owner" >&2
        echo "  2. Add @${whoami} to the @${scope} org at https://www.npmjs.com/settings/${scope}/members" >&2
        echo "  3. Rename the package to @${whoami}/prototype in package.json" >&2
      fi
    fi
  fi
  exit "$status"
}

if [[ "$DRY_RUN" -eq 0 ]]; then
  echo "Published successfully."
  echo "Install with:"
  echo "  npm install ${PACKAGE_NAME}@${PACKAGE_VERSION}"
  echo "  pnpm add ${PACKAGE_NAME}@${PACKAGE_VERSION}"
  if [[ "$SKIP_BUMP" -eq 0 ]]; then
    echo "Commit the version bump in package.json when ready."
  fi
fi
