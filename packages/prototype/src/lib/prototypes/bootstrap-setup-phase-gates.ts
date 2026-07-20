/** Hard gates for the full workspace setup copy prompt (bootstrap). */

export type BootstrapSetupPhase =
  | "preflight"
  | "link-source"
  | "workspace-profile"
  | "agent-context"
  | "component-library-sync"
  | "component-library-previews"
  | "bootstrap-api";

export const BOOTSTRAP_VERIFY_SCRIPTS = {
  sourceLinked: "pnpm verify:source-linked",
  workspaceProfile: "pnpm verify:workspace-profile",
  onboarded: "pnpm verify:onboarded",
  componentLibraryLoaded: "pnpm verify:component-library-loaded",
  componentLibrary: "pnpm verify:component-library",
  bootstrapStatus: "pnpm verify:bootstrap-status",
} as const;

/** PHASE 1 (scope): gather evidence + print the profile-authoring instruction. */
export const COMPONENT_LIBRARY_SCOPE_COMMAND =
  "node node_modules/proto-plugin/scripts/profile-design-system.mjs";

/** PHASE 2 (build): run during onboarding phase 4 — not a host package.json script. */
export const COMPONENT_LIBRARY_GENERATE_COMMAND =
  "node node_modules/proto-plugin/scripts/generate-component-library.mjs";

export const BOOTSTRAP_CHECKPOINTS: Record<BootstrapSetupPhase, string> = {
  preflight: "CHECKPOINT 0 COMPLETE: proto-plugin current",
  "link-source": "CHECKPOINT 1 COMPLETE: source linked",
  "workspace-profile": "CHECKPOINT 2 COMPLETE: workspace profile set",
  "agent-context": "CHECKPOINT 2b COMPLETE: agent context written",
  "component-library-sync":
    "CHECKPOINT 3 COMPLETE: component library synced from source",
  "component-library-previews":
    "CHECKPOINT 4 COMPLETE: component library renders on /component-library",
  "bootstrap-api":
    "CHECKPOINT 5 COMPLETE: bootstrap status API reports workspace ready",
};

const PHASE_FORBIDDEN_UNTIL_NEXT: Partial<
  Record<BootstrapSetupPhase, string[]>
> = {
  "link-source": [
    "`PROTOTYPE_USER_NAME` / workspace profile edits",
    "`prototype.sync.config.sh` or `pnpm sync-from-source`",
    "component library files",
    "broad source UI exploration beyond confirming the repo root",
  ],
  "workspace-profile": ["sync or component library work"],
  "agent-context": ["sync or component library work"],
  "component-library-sync": ["claiming setup is complete"],
  "component-library-previews": [
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
    "The gallery and `/component-library` **do not** read the disk verify scripts directly. They call `GET /api/prototypes/bootstrap-status` from the running dev server.",
    "",
    "- Disk checks (`pnpm verify:component-library-loaded`, etc.) can pass while the API still returns `complete: false` or `componentLibraryReady: false` — that leaves the UI stuck on onboarding or the library loading panel.",
    "- **Never print CHECKPOINT 4 or 5** unless the dev server is running and the bootstrap status API agrees with workspace state.",
    "- Host layout must use `createPrototypeSiteLayout` from `proto-plugin/server` so bootstrap/debug wiring stays correct. Do not hand-roll a gallery shell wrapper.",
    "- Debug floating stepper is **opt-in only** — set `DEBUG=true` in `.env.local`. It must not appear in normal host development.",
  ];
}

/** Master gate block at the top of the full bootstrap setup prompt. */
export function buildBootstrapSetupMasterGatesLines(): string[] {
  return [
    "## Phase gates (mandatory — do not skip or reorder)",
    "",
    "This setup is a sequence of **hard gates**. Finish each phase, run its verify command when listed, print its checkpoint line in your reply, then start the next phase.",
    "",
    "- **Do not parallelize across phases.**",
    "- **Do not** run `sync-from-source`, edit the component library, or explore source UI for extraction until the source is linked and the workspace profile is set (**CHECKPOINT 2**).",
    "- **Agent context (phase 2b):** Run **only** when an **Agent context** section appears below. Write **only** what the user pasted or selected — no placeholder or Proto documentation. If that section is absent, **skip phase 2b** — do not create `.proto/agent/custom-context.md` and do not print CHECKPOINT 2b.",
    "- **When the user asks why something was not done:** answer the question first. Do not silently fix and move on unless they ask you to fix it.",
    "",
    "Proto tracks progress from real workspace state — there are no flags to write. Onboarding completes once the source is linked and the profile is set; the component library unlocks once `/component-library` is populated.",
    "",
    "**Gallery unlock is API-driven.** Disk verify scripts are necessary but not sufficient — the final phase must confirm `GET /api/prototypes/bootstrap-status` returns `complete: true` and `componentLibraryReady: true` while the dev server is running.",
    "",
    "| Phase | Section | Checkpoint | Verify |",
    "| ----- | ------- | ---------- | ------ |",
    "| 0 | Proto-plugin preflight (AGENTS.md) | `CHECKPOINT 0 COMPLETE: proto-plugin current` | version API / lockfile |",
    "| 1 | Link source directory | `CHECKPOINT 1 COMPLETE: source linked` | `pnpm verify:source-linked` |",
    "| 2 | Workspace profile | `CHECKPOINT 2 COMPLETE: workspace profile set` | `pnpm verify:workspace-profile` |",
    "| 2b | Agent context (optional — only if section below) | `CHECKPOINT 2b COMPLETE: agent context written` | user content written verbatim; skip if no section |",
    "| 3 | Component library sync | `CHECKPOINT 3 COMPLETE: component library synced from source` | sync succeeded |",
    "| 4 | Component library previews | `CHECKPOINT 4 COMPLETE: component library renders on /component-library` | `pnpm verify:component-library` + browser pass |",
    "| 5 | Bootstrap status API | `CHECKPOINT 5 COMPLETE: bootstrap status API reports workspace ready` | `pnpm verify:bootstrap-status` (dev server running) |",
    "",
    "Each section below ends with **⛔ HARD STOP**. Do not begin the next section until that checkpoint is in your reply.",
    ...buildBootstrapApiAuthorityLines(),
  ];
}

/** Final gate appended after component library previews in the full setup prompt. */
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
    "Then open `/` and `/component-library` in the browser:",
    "- Gallery sidebar and prototype grid are visible (not stuck in onboarding).",
    "- `/component-library` shows accordion sections — not the \"Setting up your component library\" loading panel.",
    "- No floating bootstrap debug stepper unless `DEBUG=true` is set in `.env.local`.",
    ...buildPhaseHardStopLines("bootstrap-api", {
      verifyCommand: BOOTSTRAP_VERIFY_SCRIPTS.bootstrapStatus,
      extraVerifyLines: [
        "",
        "Do **not** tell the user setup is finished unless CHECKPOINT 5 is in your reply **and** the browser checks above pass.",
      ],
    }),
  ];
}

/** Per-section hard stop appended to individual setup prompt sections. */
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
