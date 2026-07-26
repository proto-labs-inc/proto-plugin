# Workspace onboarding

Authoritative spec for the host-app setup flow. **Read this before changing bootstrap/onboarding code.**

---

## Purpose

New host repos start with no synced design system. Until setup finishes, reviewers must **not** reach the prototype gallery, design system content, or new-prototype creation. Onboarding collects setup inputs in a modal, copies an agent prompt, and unlocks the app when real workspace state is satisfied.

---

## Derived state (source of truth)

There are **no** `.proto/onboarded` or `.proto/design-system-loaded` marker files. Bootstrap status is derived from real files on disk:


| Signal | Derived when | What it unlocks |
| ------ | ------------ | --------------- |
| `complete: true` | `SOURCE_PATH` + `PROTOTYPE_USER_NAME` in `.env.local` (symlink not required) | Gallery / dashboard (`/`). Onboarding modal closes. |
| `designSystemReady: true` | `ui-primitives`, `composite-components`, and `tokens` accordion sections exist under `src/app/design-system/` | `/design-system` accordion content. “New prototype” on the gallery. |


Server check: `GET /api/prototypes/bootstrap-status`

Implementation: `evaluateHostBootstrapStatus()` in `src/server/evaluate-prototype-bootstrap-status.ts` + `evaluate-workspace-derived-status.ts` (server-only).

Host verify scripts (`pnpm verify:onboarded`, `pnpm verify:design-system-loaded`, `pnpm verify:bootstrap-status`) are **read-only checks** of the same derived state — they do not write files.

**Important:** disk-only verify scripts can pass while the gallery UI remains locked if `GET /api/prototypes/bootstrap-status` is wrong (broken route, missing server module, bad host root resolution, or a hand-rolled gallery shell). Setup agents must run `pnpm verify:bootstrap-status` with the dev server running before declaring setup complete.

---

## Modal steps (in order)

These are **UI-only** steps inside `PrototypeBootstrapOnboardingModal`. They are **not** persisted across page refresh.


| Step id             | UI title                      | Purpose                                                    |
| ------------------- | ----------------------------- | ---------------------------------------------------------- |
| `welcome`           | Welcome to Proto!             | Entry — always shown on load when not onboarded            |
| `source-directory`  | Connect your source directory | Pick / describe source folder; may copy link-source prompt |
| `name`              | What should we call you?      | `PROTOTYPE_USER_NAME` / workspace profile                  |
| `agent-context`     | Add your agent context        | Optional AGENTS.md path or paste                           |
| `setup-complete`    | Run setup in your agent       | Copy **full** setup prompt (`buildBootstrapSetupCopyText`) |
| `component-library` | Waiting for workspace setup | After copy — waiting UI **inside the modal**; polls until `complete: true` |
| `library-loading` | Component library syncing | Post-onboard preview — gallery visible, `/design-system` loading panel, new prototype blocked |


After **Copy setup prompt** on `setup-complete`, the UI advances to `component-library` (same session only). The **onboarding modal stays open** with waiting content until `complete: true`. Gallery stays blocked until then. **Never** hide the modal or leave a blank page during onboarding.

### Refresh behavior (mandatory)

**Every full page load** while `complete: false` must open at **`welcome`**.

- In-session step advances (Continue / Back / copy prompt → `component-library`) are fine until reload.
- On reload, step state resets — only derived workspace state and the bootstrap status API decide what unlocks.

Initial step resolution: `resolveInitialBootstrapStep()` → `welcome` if `!status.complete`, else `normal`.

### Client storage — no step persistence (mandatory)

**Never** persist onboarding **step** in the browser. Step is React state in `use-bootstrap-preview.ts` for the current session only.

| Storage | Bootstrap step | Allowed? |
| ------- | ---------------- | -------- |
| `localStorage` | Current / last modal step | **No — never** |
| `sessionStorage` | Current / last modal step | **No — never** |
| URL query params (except debug) | Step for normal UX | **No** |
| React `useState` | Step until reload | **Yes** |

**Do not add** keys like `prototype-bootstrap:current-step`, `awaiting-library-sync`, or any heuristic that jumps to `setup-complete` / `component-library` on refresh.

**Removed (do not reintroduce):**

- Module: `workspace-setup-awaiting-library.ts` — deleted.
- Key: `prototype-bootstrap:awaiting-library-sync` — previously set when copying the setup prompt; on refresh it incorrectly restored `setup-complete` instead of `welcome`. **No code may read or write this key.**
- Files: `.proto/onboarded`, `.proto/design-system-loaded` — removed; status is derived from workspace state.

Copying the setup prompt must **not** write step state to the client. Advancing to `component-library` after copy is in-memory only for that page session.

**Form drafts ≠ steps:** The modal may use `usePersistedLocalString` for **input drafts** (source name, agent context path, etc.) so fields are not retyped mid-session. That pre-fills form fields only — it must **not** drive `bootstrapStep` or `resolveInitialBootstrapStep()`. Refresh always opens **`welcome`**; drafts may still be pre-filled.

---

## Gallery gate (mandatory)

While onboarding is in progress (`bootstrapStep !== "normal"` and not dismissed):


| UI                                     | Visible?                                           |
| -------------------------------------- | -------------------------------------------------- |
| Onboarding modal                       | **Always** while not onboarded — welcome through waiting-for-setup |
| Gallery sidebar + prototype grid       | **No** until bootstrap `complete: true`            |
| “Browse examples” / minimize / dismiss | **No** — never ship bypasses                       |
| Debug floating stepper                 | Only when `DEBUG=true` in `.env.local`             |


Unlock gallery **only** when bootstrap status reports `complete: true` (derived state), not when the user closes the modal or picks debug “Normal” (non-debug builds ignore “Normal”).

---

## Agent setup prompt (copy text)

Built by `buildBootstrapSetupCopyText()` in `bootstrap-setup-prompt.ts`. Phase gates live in `bootstrap-setup-phase-gates.ts` — each section appends **⛔ HARD STOP** with a required checkpoint line and verify command.

Sections **in order**:

| Phase | Section | Checkpoint | Verify |
| ----- | ------- | ---------- | ------ |
| 0 | Proto-plugin preflight (AGENTS.md) | `CHECKPOINT 0 COMPLETE: proto-plugin current` | version API / lockfile |
| 1 | Link source directory | `CHECKPOINT 1 COMPLETE: source linked` | `pnpm verify:source-linked` |
| 2 | Workspace profile | `CHECKPOINT 2 COMPLETE: workspace profile set` | `pnpm verify:workspace-profile` |
| 2b | Agent context (optional — only if section below) | `CHECKPOINT 2b COMPLETE: agent context written` | user content written verbatim; skip if no section |
| 3 | Component library sync | `CHECKPOINT 3 COMPLETE: design system synced from source` | sync succeeded |
| 4 | Component library previews | `CHECKPOINT 4 COMPLETE: design system renders on /design-system` | `pnpm verify:design-system-loaded` |
| 5 | Bootstrap status API | `CHECKPOINT 5 COMPLETE: bootstrap status API reports workspace ready` | `pnpm verify:bootstrap-status` (dev server running) |

**Agents must print each checkpoint in their reply before starting the next phase.** Do not run `sync-from-source` or edit design system files until the source is linked and workspace profile is set (**CHECKPOINT 2**). Do **not** tell the user setup is finished until **CHECKPOINT 5** passes — CHECKPOINT 4 only confirms files on disk.

Verify scripts are added/updated in host `package.json` by `pnpm setup-host` (`ensure-bootstrap-verify-scripts.mjs`).

### Component library tooling (phase 4)

After sync, the setup agent runs (from the host repo root — **not** as host `package.json` scripts):

```bash
node node_modules/proto-plugin/scripts/generate-design-system.mjs
```

This extracts tokens (SkillUI dir mode on `source/` → `.skillui/`) and scaffolds previews + `component-library-guide.md`. The agent then works the guide and loops the verify gates.

Generated artifacts (`.skillui/`, `component-library-*.generated.tsx`) are gitignored via `setup-host`; `component-library-overrides.tsx` and the guide are committed.

Reload gallery when setup finishes.

---

## Architecture map


| Piece                            | Location                                   | Server / client                                 |
| -------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| Bootstrap status API             | `prototype-bootstrap-status-route.ts`      | Server                                          |
| Derived state evaluation         | `evaluate-workspace-derived-status.ts`     | Server-only                                     |
| Flag evaluation (orchestrator)   | `evaluate-prototype-bootstrap-status.ts`   | Server-only                                     |
| Site layout + SSR onboarded hint | `create-prototype-site-layout.tsx`         | Server-only — import from `proto-plugin/server` |
| Bootstrap provider + step state  | `use-bootstrap-preview.ts`                 | Client                                          |
| Onboarding modal                 | `prototype-bootstrap-onboarding-modal.tsx` | Client — includes post-copy waiting step |
| Gallery shell gate               | `prototype-gallery-shell.tsx`              | Client                                          |
| Setup prompt copy                | `bootstrap-setup-prompt.ts`                | Shared (copy text only)                         |
| Phase gates + checkpoints        | `bootstrap-setup-phase-gates.ts`           | Shared (copy text only)                         |
| Bootstrap verify scripts         | `verify-bootstrap-flag.mjs`, `verify-bootstrap-status.mjs` + `ensure-bootstrap-verify-scripts.mjs` | Host `package.json` via `setup-host` |


**Never** import `evaluateHostBootstrapStatus` or server-only derived-state modules from the `proto-plugin` client barrel (`index.ts`).

---

## Debug mode (`DEBUG=true`)

- Set in host `.env.local` only — not `NODE_ENV`.
- Shows floating bootstrap step picker (bottom-right).
- Optional URL override: `?bootstrapPreview=welcome` (also `source-directory`, `name`, `library-loading`, …; legacy `1` → welcome, `0` → normal).
- Debug **still fetches** bootstrap status; URL override is optional.
- Debug is for **package development**, not default host UX.

---

## Component library loading panel

After gallery unlock (`complete: true`) but before `designSystemReady`:

- `/design-system` shows loading panel (not accordion previews).
- Gallery “New prototype” stays blocked.

Helper: `shouldShowDesignSystemLoadingPanel()` — keyed off `designSystemReady` only, not bootstrap step.

---

## Anti-patterns (do not reintroduce)

1. **“Browse examples”** or any control that hides the modal but shows the gallery before onboarding completes
2. **Any client persistence of bootstrap step** — `localStorage`, `sessionStorage`, cookies, or URL params that restore modal steps on refresh
3. **`.proto/onboarded` or `.proto/design-system-loaded` marker files**
4. **Using form-draft `localStorage` to infer step**
5. **Skipping bootstrap fetch** when `DEBUG=true`
6. **Importing server-only bootstrap code** into client barrel exports
7. **Showing debug stepper** in all dev builds
8. **Skipping phase checkpoints** — starting sync or design system before CHECKPOINT 2
9. **Declaring setup complete at CHECKPOINT 4** — disk verify passed but bootstrap status API not checked
10. **Hand-rolling gallery layout** — bypassing `createPrototypeSiteLayout` from `proto-plugin/server`
11. **Unlocking gallery** on modal dismiss or debug “Normal” in production
12. **Hiding the onboarding modal** before bootstrap `complete: true`

---

## Checklist before shipping onboarding changes

- Fresh host: refresh always lands on **welcome**
- No step persistence keys written on copy prompt or step advance
- No gallery/sidebar until bootstrap `complete: true` (derived)
- No dismiss / browse bypass on the modal
- After source link + profile set, gallery loads without manual refresh (poll on `component-library` step or refetch on focus)
- Component library locked until `designSystemReady: true` (derived)
- `pnpm verify:bootstrap-status` passes with dev server running before setup is declared complete
- `createPrototypeSiteLayout` imported from `proto-plugin/server` only
- `AGENTS.md` + this doc updated if behavior changes
