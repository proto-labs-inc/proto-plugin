export const COMMENT_STORAGE_NOT_CONFIGURED_MESSAGE =
  "Comment storage is not configured. Set Upstash Redis and Vercel Blob env vars.";

export function isCommentStorageSetupError(message: string | null | undefined): boolean {
  if (!message) return false;
  return (
    message.includes("not configured") ||
    message.includes("Upstash Redis") ||
    message.includes("Vercel Blob") ||
    message.includes("KV_REST") ||
    message.includes("BLOB_")
  );
}

export type CommentStorageSetupPromptOptions = {
  vercelProjectName?: string;
  vercelTeamSlug?: string;
};

export function buildCommentStorageSetupPrompt({
  vercelProjectName = "proto-plugin",
  vercelTeamSlug = "maayan-alberts-projects",
}: CommentStorageSetupPromptOptions = {}): string {
  const upstashTermsUrl = `https://vercel.com/${vercelTeamSlug}/~/integrations/accept-terms/upstash?source=cli`;

  return [
    "Set up prototype storage (Upstash Redis + Vercel Blob) for this host app. **Do every step yourself** — the user should not run commands manually.",
    "",
    "## Your job",
    "Provision both stores on Vercel, pull env vars locally, restart dev, and confirm Comments + gallery storage work. Only stop to ask the user when a browser step is unavoidable (marketplace terms).",
    "",
    "## Vercel project",
    `- Project: \`${vercelProjectName}\``,
    `- Team: \`${vercelTeamSlug}\``,
    "",
    "## Step 1 — Link the repo (skip if \`.vercel/project.json\` exists)",
    "```bash",
    `npx vercel link --yes --project ${vercelProjectName} --scope ${vercelTeamSlug}`,
    "```",
    "",
    "## Step 2 — Accept Upstash marketplace terms (browser — ask user once)",
    "If `vercel integration add` returns `integration_terms_acceptance_required`, send the user this URL and wait for confirmation before retrying:",
    upstashTermsUrl,
    "",
    "## Step 3 — Install Upstash Redis",
    "```bash",
    "npx vercel integration add upstash/upstash-kv -m primaryRegion=sfo1 -p free -n proto-plugin-redis",
    "```",
    "",
    "Connect to **development**, **preview**, and **production** (default when prompted with `--yes`).",
    "",
    "## Step 4 — Create Vercel Blob store (required)",
    "Gallery screenshots need Blob — not optional.",
    "",
    "```bash",
    "npx vercel blob create-store proto-plugin-blob --access public -y -e development -e preview -e production",
    "```",
    "",
    "If a store already exists, connect it to this project from Vercel → Storage, or use `vercel blob list-stores` and ensure `BLOB_READ_WRITE_TOKEN` is on the project.",
    "",
    "## Step 5 — Verify env vars exist on Vercel",
    "```bash",
    "npx vercel env ls",
    "npx vercel integration list",
    "```",
    "",
    "Required before continuing:",
    "- `KV_REST_API_URL`",
    "- `KV_REST_API_TOKEN`",
    "- `BLOB_READ_WRITE_TOKEN`",
    "",
    "If `vercel env pull` previously only gave `VERCEL_OIDC_TOKEN`, that is CLI auth — not storage. Storage vars appear only after steps 3–4 succeed.",
    "",
    "## Step 6 — Pull env vars locally (required — do not skip)",
    "`.env.local` holds host-only values like `SOURCE_PATH`. **Never** pull into `.env.local` — it overwrites that file.",
    "",
    "Pull development env vars into a separate file:",
    "",
    "```bash",
    "npx vercel env pull .env.development.local -y",
    "```",
    "",
    "Next.js loads both `.env.local` and `.env.development.local` in development.",
    "",
    "After pull, confirm `.env.development.local` contains `KV_REST_*` and `BLOB_READ_WRITE_TOKEN`. Leave `SOURCE_PATH` in `.env.local` untouched.",
    "",
    "## Step 7 — Restart dev and verify",
    "```bash",
    "pnpm dev",
    "```",
    "",
    "Then confirm storage is configured:",
    "",
    "```bash",
    "curl -s http://localhost:1985/api/prototypes/storage-status",
    "```",
    "",
    "Expect:",
    "- `comments.configured: true`",
    "- `gallery.storageConfigured: true`",
    "",
    "Open a prototype → Comments sidebar should load with no setup prompt (empty list is fine).",
    "",
    "## Required env vars (all three)",
    "| Var | Purpose |",
    "| --- | --- |",
    "| `KV_REST_API_URL` | Upstash Redis — comments, change log, gallery metadata |",
    "| `KV_REST_API_TOKEN` | Upstash Redis token |",
    "| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — gallery screenshot uploads |",
    "",
    "Either `KV_*` or `UPSTASH_REDIS_REST_*` works — the app normalizes both.",
    "",
    "## Reference",
    "- Env template: `.env.example`",
    "- Storage status: `packages/prototype/src/server/prototype-storage-status-route.ts`",
    "- Redis client: `packages/prototype/src/server/redis/client.ts`",
  ].join("\n");
}

export function buildCommentStorageSetupCopyText(
  options: CommentStorageSetupPromptOptions = {},
): string {
  return buildCommentStorageSetupPrompt(options);
}
