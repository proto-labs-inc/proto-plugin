/** Hard gates for the full workspace setup copy prompt (bootstrap). */

export type BootstrapSetupPhase =
  | "preflight"
  | "link-source"
  | "workspace-profile"
  | "agent-context"
  | "design-system-sync"
  | "design-system-previews"
  | "bootstrap-api";

export const BOOTSTRAP_VERIFY_SCRIPTS = {
  sourceLinked: "pnpm verify:source-linked",
  workspaceProfile: "pnpm verify:workspace-profile",
  onboarded: "pnpm verify:onboarded",
  designSystemLoaded: "pnpm verify:design-system-loaded",
  designSystemStatic: "pnpm verify:design-system-static",
  designSystemVisual: "pnpm verify:design-system-visual",
  tailwindThemeRegistration: "pnpm verify:tailwind-theme",
  bootstrapStatus: "pnpm verify:bootstrap-status",
} as const;

/** Extract host-safe @theme registration CSS from a source theme entrypoint. */
export const EXTRACT_TAILWIND_THEME_COMMAND =
  "node node_modules/proto-plugin/scripts/extract-tailwind-theme.mjs";

export const DESIGN_SYSTEM_GENERATE_COMMAND =
  "node node_modules/proto-plugin/scripts/generate-design-system.mjs";

export const BOOTSTRAP_CHECKPOINTS: Record<BootstrapSetupPhase, string> = {
  preflight: "CHECKPOINT 0 COMPLETE: proto-plugin current",
  "link-source": "CHECKPOINT 1 COMPLETE: source linked",
  "workspace-profile": "CHECKPOINT 2 COMPLETE: workspace profile set",
  "agent-context": "CHECKPOINT 2b COMPLETE: agent context written",
  "design-system-sync":
    "CHECKPOINT 3 COMPLETE: design system synced from source",
  "design-system-previews":
    "CHECKPOINT 4 COMPLETE: design system renders on /design-system",
  "bootstrap-api":
    "CHECKPOINT 5 COMPLETE: bootstrap status API reports workspace ready",
};

const PHASE_FORBIDDEN_UNTIL_NEXT: Partial<
  Record<BootstrapSetupPhase, string[]>
> = {
  "link-source": [
    "`PROTOTYPE_USER_NAME` / workspace profile edits",
    "`prototype.sync.config.sh` or `pnpm sync-from-source`",
    "design system files",
    "broad source UI exploration beyond confirming the repo root",
  ],
  "workspace-profile": ["sync or design system work"],
  "agent-context": ["sync or design system work"],
  "design-system-sync": [
    "claiming setup is complete",
    "syncing into or overwriting bundled Supabase dirs (`packages/ui`, `packages/ui-patterns`, `packages/config`)",
    "removing Supabase `@import`s from `src/app/globals.css` or overwriting `table-editor-filters-theme.css`",
  ],
  "design-system-previews": [
    "printing CHECKPOINT 5 or claiming setup is fully finished",
  ],
};

function buildForbiddenLines(phase: BootstrapSetupPhase): string[] {
  const forbidden = PHASE_FORBIDDEN_UNTIL_NEXT[phase];
  if (!forbidden?.length) return [];
  return [
    "",
    "**Forbidden until the next checkpoint:**",
    ...forbidden.map((item) => `- ${item}`),
  ];
}

function buildVerifyLines(
  phase: BootstrapSetupPhase,
  verifyCommand?: string,
): string[] {
  if (!verifyCommand) return [];
  return [
    "",
    "### Verify",
    "",
    "```bash",
    verifyCommand,
    "```",
  ];
}

function buildBootstrapApiAuthorityLines(): string[] {
  return [
    "",
    "### Authoritative unlock check (mandatory before CHECKPOINT 5)",
    "",
    "The gallery and `/design-system` **do not** read the disk verify scripts directly. They call `GET /api/prototypes/bootstrap-status` from the running dev server.",
    "",
    "- Disk checks (`pnpm verify:design-system-loaded`, etc.) can pass while the API still returns `complete: false` or `designSystemReady: false` — that leaves the UI stuck on onboarding or the design system loading panel.",
    "- **Never print CHECKPOINT 4 or 5** unless the dev server is running and the bootstrap status API agrees with workspace state.",
    "- Host layout must use `createPrototypeSiteLayout` from `proto-plugin/server` so bootstrap/debug wiring stays correct. Do not hand-roll a gallery shell wrapper.",
    "- Debug floating stepper is **opt-in only** — set `DEBUG=true` in `.env.local`. It must not appear in normal host development.",
  ];
}

export function buildBootstrapSetupMasterGatesLines(): string[] {
  return [
    "## Phase gates (mandatory — do not skip or reorder)",
    "",
    "This setup is a sequence of **hard gates**. Finish each phase, run its verify command when listed, print its checkpoint line in your reply, then start the next phase.",
    "",
    "- **Do not parallelize across phases.**",
    "- **Do not** run `sync-from-source`, edit the design system, or explore source UI for extraction until the source is linked and the workspace profile is set (**CHECKPOINT 2**).",
    "- **Agent context (phase 2b):** Write **only** what the user pasted or selected — verbatim. Empty content means delete `.proto/agent/custom-context.md` if it exists. Do **not** add placeholder or Proto documentation.",
    "- **When the user asks why something was not done:** answer the question first. Do not silently fix and move on unless they ask you to fix it.",
    "- **Supabase template hosts:** If the repo ships bundled Supabase packages (`packages/ui`, `packages/config`, …) or `table-editor-filters-theme.css`, sync linked-source tokens to a **separate path** and **append** imports in `src/app/globals.css` — never overwrite or merge into those Supabase dirs.",
    "",
    "Proto tracks progress from real workspace state — there are no flags to write. Onboarding completes once the source is linked and the profile is set; the design system unlocks once `/design-system` is populated.",
    "",
    "**Gallery unlock is API-driven.** Disk verify scripts are necessary but not sufficient — the final phase must confirm `GET /api/prototypes/bootstrap-status` returns `complete: true` and `designSystemReady: true` while the dev server is running.",
    "",
    "| Phase | Section | Checkpoint | Verify |",
    "| ----- | ------- | ---------- | ------ |",
    "| 0 | Proto-plugin preflight (AGENTS.md) | `CHECKPOINT 0 COMPLETE: proto-plugin current` | version API / lockfile |",
    "| 1 | Link source directory | `CHECKPOINT 1 COMPLETE: source linked` | `pnpm verify:source-linked` |",
    "| 2 | Workspace profile | `CHECKPOINT 2 COMPLETE: workspace profile set` | `pnpm verify:workspace-profile` |",
    "| 2b | Agent context | `CHECKPOINT 2b COMPLETE: agent context written` | user content verbatim; empty → file removed |",
    "| 3 | Design system sync | `CHECKPOINT 3 COMPLETE: design system synced from source` | sync + `pnpm verify:tailwind-theme` (VALUES **and** `@theme` registration) |",
    "| 4 | Design system tokens | `CHECKPOINT 4 COMPLETE: design system renders on /design-system` | `pnpm verify:design-system-static` + `pnpm verify:tailwind-theme` + `pnpm build` + `pnpm verify:design-system-visual` (dev server) |",
    "| 5 | Bootstrap status API | `CHECKPOINT 5 COMPLETE: bootstrap status API reports workspace ready` | `pnpm verify:bootstrap-status` + `pnpm verify:design-system-visual` (dev server running) |",
    "",
    "Each section below ends with **⛔ HARD STOP**. Do not begin the next section until that checkpoint is in your reply.",
    ...buildBootstrapApiAuthorityLines(),
  ];
}

export function buildBootstrapSetupFinalApiGateLines(): string[] {
  return [
    "## Bootstrap status API (final gate)",
    "",
    "With `pnpm dev` running, confirm the gallery's authoritative bootstrap status matches workspace state on disk.",
    "",
    "```bash",
    BOOTSTRAP_VERIFY_SCRIPTS.bootstrapStatus,
    "```",
    "",
    "Then open `/` and `/design-system` in the browser:",
    "- Gallery sidebar and prototype grid are visible (not stuck in onboarding).",
    "- `/design-system` shows design token swatches with **visible colors** — not blank/transparent squares.",
    "- No floating bootstrap debug stepper unless `DEBUG=true` is set in `.env.local`.",
    "",
    "**Visual gate (required):**",
    "```bash",
    BOOTSTRAP_VERIFY_SCRIPTS.designSystemVisual,
    "```",
    ...buildPhaseHardStopLines("bootstrap-api", {
      verifyCommand: BOOTSTRAP_VERIFY_SCRIPTS.bootstrapStatus,
      extraVerifyLines: [
        "",
        "Do **not** tell the user setup is finished unless CHECKPOINT 5 is in your reply **and** the browser checks above pass.",
      ],
    }),
  ];
}

export function buildPhaseHardStopLines(
  phase: BootstrapSetupPhase,
  options: { verifyCommand?: string; extraVerifyLines?: string[] } = {},
): string[] {
  const checkpoint = BOOTSTRAP_CHECKPOINTS[phase];
  const lines = [
    "",
    "### ⛔ HARD STOP",
    "",
    `Reply must include exactly: **\`${checkpoint}\`**`,
    "",
    "Do not begin the next phase until that line is in your reply.",
    ...buildForbiddenLines(phase),
    ...buildVerifyLines(phase, options.verifyCommand),
  ];

  if (options.extraVerifyLines?.length) {
    lines.push(...options.extraVerifyLines);
  }

  return lines;
}
