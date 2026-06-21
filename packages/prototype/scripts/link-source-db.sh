#!/usr/bin/env bash
set -euo pipefail

TOOL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/source-path.sh
source "$TOOL_ROOT/scripts/lib/source-path.sh"
# shellcheck source=lib/host-config.sh
source "$TOOL_ROOT/scripts/lib/host-config.sh"
HOST_ROOT="$(resolve_host_root "$TOOL_ROOT")"

if ! load_host_config "$HOST_ROOT"; then
  exit 1
fi

if [[ "${SOURCE_DB_ENV_VARS+set}" != set || "${#SOURCE_DB_ENV_VARS[@]}" -eq 0 ]]; then
  echo "No SOURCE_DB_ENV_VARS configured in the host sync config." >&2
  echo "Add the env var names to copy from the source app to prototype.sync.config.sh." >&2
  exit 1
fi

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  if ! TARGET="$(resolve_source_path "$HOST_ROOT")"; then
    echo "Set SOURCE_PATH in .env.local (see .env.example), or pass a path:" >&2
    echo "  pnpm link-source-db /path/to/source-app" >&2
    exit 1
  fi
elif [[ "$TARGET" != /* ]]; then
  TARGET="$HOST_ROOT/$TARGET"
fi

SOURCE_ENV="$TARGET/.env.local"
LOCAL_ENV="$HOST_ROOT/.env.local"

if [[ ! -d "$TARGET" ]]; then
  echo "Source app not found at: $TARGET" >&2
  exit 1
fi

if [[ ! -f "$SOURCE_ENV" ]]; then
  echo "Source env file not found at: $SOURCE_ENV" >&2
  echo "Create it in the source app repo (see source app local dev docs)." >&2
  exit 1
fi

extract_env() {
  local file="$1"
  local key="$2"
  local line value

  line="$(grep -E "^(#\s*)?${key}=" "$file" | tail -1 || true)"
  if [[ -z "$line" ]]; then
    return 1
  fi

  value="${line#"${line%%=*}"=}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"

  if [[ "$value" == \"*\" && "$value" == *\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
    value="${value:1:${#value}-2}"
  fi

  printf '%s' "$value"
}

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"
  local tmp escaped

  escaped="${value//\\/\\\\}"
  escaped="${escaped//\"/\\\"}"

  if [[ ! -f "$file" ]]; then
    printf '%s="%s"\n' "$key" "$escaped" >>"$file"
    return
  fi

  tmp="$(mktemp)"
  if grep -q "^${key}=" "$file"; then
    awk -v key="$key" -v value="$escaped" '
      BEGIN { updated = 0 }
      $0 ~ "^" key "=" {
        print key "=\"" value "\""
        updated = 1
        next
      }
      { print }
      END {
        if (!updated) {
          print key "=\"" value "\""
        }
      }
    ' "$file" >"$tmp"
  else
    cp "$file" "$tmp"
    printf '\n%s="%s"\n' "$key" "$escaped" >>"$tmp"
  fi

  mv "$tmp" "$file"
}

linked=0
for key in "${SOURCE_DB_ENV_VARS[@]}"; do
  if value="$(extract_env "$SOURCE_ENV" "$key")"; then
    upsert_env "$LOCAL_ENV" "$key" "$value"
    echo "Linked $key from $SOURCE_ENV"
    linked=$((linked + 1))
  fi
done

if [[ "$linked" -eq 0 ]]; then
  echo "No configured vars found in $SOURCE_ENV." >&2
  echo "Uncomment or add the SOURCE_DB_ENV_VARS entries in the source app's .env.local first." >&2
  exit 1
fi

if [[ -n "${SOURCE_DB_CONSOLE_URL:-}" ]]; then
  echo "Updated $LOCAL_ENV ($linked vars). Console: $SOURCE_DB_CONSOLE_URL"
else
  echo "Updated $LOCAL_ENV ($linked vars)."
fi
