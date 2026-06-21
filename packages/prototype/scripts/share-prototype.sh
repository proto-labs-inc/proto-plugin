#!/usr/bin/env bash
set -euo pipefail

TOOL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/source-path.sh
source "$TOOL_ROOT/scripts/lib/source-path.sh"
HOST_ROOT="$(resolve_host_root "$TOOL_ROOT")"
cd "$HOST_ROOT"

if [[ -z "${VERCEL_PROJECT:-}" && -f "$HOST_ROOT/package.json" ]]; then
  VERCEL_PROJECT="$(node -pe "require('$HOST_ROOT/package.json').name" 2>/dev/null || true)"
fi
VERCEL_PROJECT="${VERCEL_PROJECT:-}"
PUSH=1
OPEN=0
SLUG=""

usage() {
  cat <<EOF
Usage: $(basename "$0") [options] <prototype-slug>

Push the current branch, wait for the Vercel preview deployment, and copy a
shareable link to the prototype (e.g. /prototypes/example-feature).

Before pushing, stages all changes (git add -A) and commits them when needed.

Options:
  --no-push          Skip git push (use the current branch HEAD on GitHub)
  --open             Open the shareable link in your browser
  --project <name>   Vercel project to use (default: from VERCEL_PROJECT or package.json name)
  -h, --help         Show this help message

Examples:
  pnpm share-prototype example-feature
  pnpm share-prototype --no-push example-feature

Requires: git, gh (authenticated), and network access.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-push)
      PUSH=0
      shift
      ;;
    --open)
      OPEN=1
      shift
      ;;
    --project)
      [[ $# -ge 2 ]] || {
        echo "Missing value for --project" >&2
        exit 1
      }
      VERCEL_PROJECT="$2"
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
    *)
      if [[ -n "$SLUG" ]]; then
        echo "Unexpected argument: $1" >&2
        usage >&2
        exit 1
      fi
      SLUG="$1"
      shift
      ;;
  esac
done

if [[ -z "$SLUG" ]]; then
  usage >&2
  exit 1
fi

if [[ -z "$VERCEL_PROJECT" ]]; then
  echo "Set VERCEL_PROJECT or pass --project <name>." >&2
  exit 1
fi

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_command git
require_command gh

if ! gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

remote_url="$(git remote get-url origin 2>/dev/null || true)"
if [[ -z "$remote_url" ]]; then
  echo "No git remote named origin found." >&2
  exit 1
fi

if [[ "$remote_url" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
  REPO_OWNER="${BASH_REMATCH[1]}"
  REPO_NAME="${BASH_REMATCH[2]%.git}"
else
  echo "Could not parse GitHub owner/repo from origin: $remote_url" >&2
  exit 1
fi

branch="$(git branch --show-current)"
if [[ -z "$branch" ]]; then
  echo "Detached HEAD — checkout a branch before sharing." >&2
  exit 1
fi

copy_to_clipboard() {
  local text="$1"
  if command -v pbcopy >/dev/null 2>&1; then
    printf '%s' "$text" | pbcopy
  elif command -v wl-copy >/dev/null 2>&1; then
    printf '%s' "$text" | wl-copy
  elif command -v xclip >/dev/null 2>&1; then
    printf '%s' "$text" | xclip -selection clipboard
  else
    echo "Could not copy to clipboard (install pbcopy, wl-copy, or xclip)." >&2
    return 1
  fi
}

extract_branch_preview_host() {
  local sha="$1"
  local summary

  summary="$(
    gh api \
      "repos/$REPO_OWNER/$REPO_NAME/commits/$sha/check-runs?per_page=30" \
      --jq '.check_runs[] | select(.name == "Vercel Preview Comments") | .output.summary' \
      2>/dev/null | head -1
  )"

  if [[ -z "$summary" ]]; then
    return 1
  fi

  if [[ "$summary" =~ vercel\.live/open-feedback/([a-z0-9.-]+\.vercel\.app) ]]; then
    printf '%s\n' "${BASH_REMATCH[1]}"
    return 0
  fi

  if [[ "$summary" =~ (https?://)?([a-z0-9.-]+\.vercel\.app) ]]; then
    printf '%s\n' "${BASH_REMATCH[2]}"
    return 0
  fi

  return 1
}

extract_deployment_preview_url() {
  local sha="$1"
  local deployment_id environment_url

  deployment_id="$(
    gh api \
      "repos/$REPO_OWNER/$REPO_NAME/deployments?sha=$sha&per_page=20" \
      --jq ".[] | select(.environment == \"Preview – $VERCEL_PROJECT\") | .id" \
      2>/dev/null | head -1
  )"

  if [[ -z "$deployment_id" ]]; then
    return 1
  fi

  environment_url="$(
    gh api \
      "repos/$REPO_OWNER/$REPO_NAME/deployments/$deployment_id/statuses" \
      --jq '.[] | select(.state == "success" and .environment_url != null) | .environment_url' \
      2>/dev/null | head -1
  )"

  if [[ -z "$environment_url" ]]; then
    return 1
  fi

  printf '%s\n' "$environment_url"
}

resolve_preview_origin() {
  local sha="$1"
  local host origin

  if host="$(extract_branch_preview_host "$sha")"; then
    printf 'https://%s\n' "$host"
    return 0
  fi

  if origin="$(extract_deployment_preview_url "$sha")"; then
    origin="${origin%/}"
    printf '%s\n' "$origin"
    return 0
  fi

  return 1
}

wait_for_preview_origin() {
  local sha="$1"
  local attempt=0
  local max_attempts=60
  local origin=""

  while (( attempt < max_attempts )); do
    if origin="$(resolve_preview_origin "$sha")"; then
      printf '%s\n' "$origin"
      return 0
    fi

    sleep 10
    ((attempt += 1))
  done

  echo "Timed out waiting for Vercel preview deployment." >&2
  echo "Check deployments: https://github.com/$REPO_OWNER/$REPO_NAME/deployments" >&2
  return 1
}

share_url=""
sha=""

if [[ "$PUSH" -eq 1 ]]; then
  echo "Staging changes..."
  git add -A

  if ! git diff --cached --quiet; then
    echo "Committing staged changes..."
    git commit -m "Update prototype: $SLUG"
  fi

  echo "Pushing branch: $branch"
  git push -u origin HEAD
else
  echo "Skipping push (using current branch HEAD on origin)."
fi

sha="$(git rev-parse HEAD)"
echo "Commit: ${sha:0:7} on $branch"
echo "Building..." >&2

origin="$(wait_for_preview_origin "$sha")"
share_url="${origin%/}/prototypes/${SLUG}"

echo
echo "Shareable link:"
echo "$share_url"
echo

if copy_to_clipboard "$share_url"; then
  echo "Copied to clipboard."
else
  echo "Copy the link above manually."
fi

if [[ "$OPEN" -eq 1 ]]; then
  if command -v open >/dev/null 2>&1; then
    open "$share_url"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$share_url"
  else
    echo "Could not open browser automatically." >&2
  fi
fi
