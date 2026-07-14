# prototype

Shared framework for building shareable UI prototypes in Next.js — review shell, comment anchoring, variant exploration, and the prototype home gallery.

Host apps keep **project-specific** code: prototypes under `src/prototypes/`, design tokens in `globals.css`, synced `@/components/ui`, and styleguide pages. The `prototype` package owns everything reusable across projects.

## Install

From npm (public):

```bash
pnpm add proto-plugin
# or
npm install proto-plugin
```

## Host setup

1. **Register prototypes** in `prototype.config.ts` at the repo root:

```ts
import { definePrototypeConfig } from "proto-plugin";
import MyPrototype from "./src/prototypes/my-slug";
import { myComponentRegistry } from "./src/prototypes/my-slug/component-ids";

export default definePrototypeConfig({
  prototypes: [
    {
      slug: "my-slug",
      title: "My prototype",
      screenshot: "/prototypes/screenshots/my-slug.png",
      component: MyPrototype,
      componentRegistry: myComponentRegistry,
    },
  ],
});
```

2. **Gallery home** — `src/app/(platform-gallery)/page.tsx`:

```tsx
import { createPrototypeGalleryPage } from "proto-plugin";
import prototypeConfig from "../../../prototype.config";

export default createPrototypeGalleryPage(prototypeConfig);
```

3. **Prototype route** — `src/app/(source-prototype)/prototypes/[slug]/page.tsx`:

```tsx
import { createPrototypePage } from "proto-plugin";
import prototypeConfig from "../../../../../prototype.config";

const page = createPrototypePage(prototypeConfig);
export default page.default;
export const generateStaticParams = page.generateStaticParams;
```

4. **Component library** — `src/app/component-library/page.tsx` (created automatically on `pnpm install` if missing; or run `pnpm --dir node_modules/proto-plugin setup-host`):

```tsx
import { createPrototypeComponentLibraryPage } from "proto-plugin";

export default createPrototypeComponentLibraryPage();
```

Pass `children` once you've synced UI from source. Until then, the page shows an empty state with a copyable agent prompt.

5. **Next.js config** — transpile the package (use a relative import so CSS is not loaded during config evaluation):

```ts
import { withPrototype } from "./packages/prototype/src/config/with-prototype";

export default withPrototype({ nextConfig: { /* … */ } });
```

6. **Tailwind** — scan prototype package components from the host `globals.css`. Register semantic `--color-*` tokens as self-referential vars so utilities like `text-muted-foreground` resolve from `[data-prototype-root]` at runtime — **do not** map `--color-foreground` / `--color-background` to product `:root` tokens (that breaks gallery contrast):

```css
@import "tailwindcss";
@source "../../packages/prototype/src/**/*.{js,ts,jsx,tsx}";

@theme inline {
  --color-foreground: var(--color-foreground);
  --color-muted-foreground: var(--color-muted-foreground);
  /* …other semantic colors used by proto-plugin */
}
```

Product tokens use separate names (e.g. `--product-background`) scoped to `[data-prototype-screenshot]`.

7. **Root layout + tool themes** — wrap routes with `createPrototypeSiteLayout()` and import package chrome CSS (dark/light themes live here, not in host `globals.css`):

```tsx
import { createPrototypeSiteLayout } from "proto-plugin";
import "proto-plugin/styles/globals.css";
import "./globals.css";

const PrototypeSiteLayout = createPrototypeSiteLayout();
```

8. **tsconfig paths** (optional, for tool internal `@prototype/*` alias when developing the package):

```json
{
  "compilerOptions": {
    "paths": {
      "proto-plugin": ["./packages/prototype/src/index.ts"],
      "proto-plugin/server": ["./packages/prototype/src/server.ts"]
    }
  }
}
```

9. **Dev server port** — run the host on port **1985** so it stays separate from a typical source app on 3000. In the host `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p 1985"
  }
}
```

Open [http://localhost:1985](http://localhost:1985) when developing.

## Public API

| Export | Use |
| --- | --- |
| `definePrototypeConfig` | Register prototypes (sets global config as a side effect) |
| `createPrototypePage` | Factory for `/prototypes/[slug]` page + `generateStaticParams` |
| `createPrototypeComponentLibraryPage` | Factory for `/component-library` (empty state until host passes `children`) |
| `createPrototypeRegistry` | Server helpers: `getAllPrototypes`, `getPrototype`, … |
| `PrototypeComponent`, `PrototypeControl` | Comment-anchorable UI wrappers |
| `PrototypeShell` | Review chrome (comments sidebar, screenshot capture) |
| `PrototypeVariantExplorer` | Multi-variant design exploration |
| `usePrototypeComments` | Live state + comment restore |
| `PrototypeGalleryClient` | Card grid for prototype home |
| `PrototypeGalleryShell`, `PrototypeGalleryHeader`, `PrototypeGalleryPage` | Tool-styled gallery layout (wrap in host route at `/`) |
| `definePrototypeComponentRegistry` | Per-prototype component id registry |

**Server-only** (import from `proto-plugin/server`):

- `readScreenshotManifest`
- `touchScreenshotManifest`

## Styles

The `prototype` package uses the **host design system** — same tokens and Tailwind utilities as prototype pages.

| Layer | Path |
| --- | --- |
| Host tokens + Tailwind | Host `src/app/globals.css` |
| shadcn primitives | `src/components/ui/` |
| Tool composites (sidebar, panel, toolbar, menus) | `src/components/platform-ui/` |

Host `globals.css` must `@source` prototype package TSX for Tailwind utilities.

**Do not** implement gallery/review dark or light mode in host `globals.css`. Import `proto-plugin/styles/globals.css` in `layout.tsx` — the package defines both themes on `[data-prototype-root]` (default dark; `data-prototype-comment-theme="light"` for light). Host `globals.css` is for **product** tokens synced from the source app (prototype preview content only).

## Publish

From `packages/prototype/`:

```bash
npm login
pnpm publish-package
```

Uses the public npm registry (`registry.npmjs.org`).

## Verify component ids

From the host repo root (forwards to the `prototype` package):

```bash
pnpm verify:prototype-ids
```

Or run directly in the package:

```bash
pnpm --filter prototype verify:prototype-ids
```

Runs `scripts/verify-prototype-component-ids.mjs` against the host's `src/prototypes/*/`.

## Source app sync

Scripts live in `scripts/` and resolve the host root via `prototype.config.ts`.

The scripts are host-agnostic: which files to sync, which components the host
has customized, and which source-app env vars to link are all declared by the
host in a `prototype.sync.config.sh` at its repo root (template:
`scripts/lib/host-config.example.sh`).

From the host repo root:

```bash
pnpm link-source          # symlink source/ in editor
pnpm sync-from-source     # sync files declared in prototype.sync.config.sh
pnpm link-source-db       # copy configured env vars from source .env.local
```

Or run directly in the package:

```bash
pnpm --filter prototype link-source
pnpm --filter prototype sync-from-source
pnpm --filter prototype link-source-db
pnpm --filter prototype share-prototype <slug>
pnpm --filter prototype download-mobbin-references
```

Set `SOURCE_PATH` in the host `.env.local` (see host `.env.example`).

### Share a prototype preview

```bash
pnpm share-prototype example-feature
pnpm share-prototype --no-push example-feature
```

Uses `VERCEL_PROJECT` when set, otherwise the host `package.json` name. Override with `--project <name>`.

### Mobbin reference images

```bash
pnpm download-mobbin-references
pnpm download-mobbin-references -- --ids=uuid1,uuid2
```

## Starter prompt (for AI agents)

Copy the block below into a new agent chat to scaffold a host app from scratch. The agent should ask you for a few values up front — **one question at a time** — then handle the rest (including inferring what to sync from source).

````markdown
Set up a new Next.js host app for `proto-plugin` — a framework for shareable UI prototypes.

## Before you start — ask me for these

Do not scaffold or run commands until I answer all four questions. Ask **one question at a time** — wait for my reply before asking the next:

1. **Host app name** — What should the new Next.js project directory be called? (e.g. `my-product-prototypes`)
2. **Where to create it** — Parent directory as an absolute path (e.g. `/Users/maayanalbert/Projects`), or confirm you want it in the current workspace.
3. **Source app path** — Absolute path to the real product repo whose UI we'll prototype (used for the `source/` symlink and sync).
4. **Optional env** — Should I configure comment/screenshot persistence now (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, `BLOB_READ_WRITE_TOKEN`), or skip that for later?

After I answer all four, do all setup yourself.

## 1. Scaffold the app

Create a new directory and initialize a vanilla Next.js app using the host app name and parent path I gave you:

- App Router, TypeScript, Tailwind CSS v4, ESLint, pnpm
- No src-dir alias tricks beyond what Next generates (`src/app/…`)
- React 19 + Next.js 15+

Run `pnpm create next-app@latest` with the host app name I provided (`--typescript --tailwind --eslint --app --src-dir --use-pnpm`), in the parent directory I specified, then `cd` into the new project.

Install the package:

```bash
pnpm add proto-plugin
```

## 2. Wire the host app

Follow the package README (`node_modules/proto-plugin/README.md`) and implement every host step:

1. **`prototype.config.ts`** at the repo root — start with an empty `prototypes: []` array using `definePrototypeConfig` from `proto-plugin`.
2. **Gallery home** — `src/app/page.tsx` via `createPrototypeGalleryPage(prototypeConfig)`.
3. **Prototype route** — `src/app/prototypes/[slug]/page.tsx` via `createPrototypePage(prototypeConfig)` (export `default` + `generateStaticParams`).
4. **Component library** — `src/app/component-library/page.tsx` via `createPrototypeComponentLibraryPage()` (auto-scaffolded on `pnpm install` if missing; shows empty state + copyable populate prompt until synced UI is wired as `children`).
5. **Root layout** — wrap children with `createPrototypeSiteLayout()` from `proto-plugin` in `src/app/layout.tsx`, and import the tool chrome theme:

   ```tsx
   import { createPrototypeSiteLayout } from "proto-plugin";
   import "proto-plugin/styles/globals.css";
   import "./globals.css";
   ```
6. **API catch-all** — `src/app/api/[...path]/route.ts` using `createPrototypeApiRoute(prototypeConfig)` from `proto-plugin/server`; export `GET`, `POST`, and `PUT` handlers that call `dispatch`.
7. **`next.config.ts`** — wrap with `withPrototype` from `proto-plugin/with-prototype` and ensure `proto-plugin` is transpiled.
8. **`src/app/globals.css`** — Tailwind v4 + product tokens synced from source. **Do not** put tool chrome dark/light mode here (no `prefers-color-scheme`, no hardcoded gallery colors). Scan package components:

   ```css
   @import "tailwindcss";
   @source "../../node_modules/proto-plugin/src/**/*.{js,ts,jsx,tsx}";
   ```

   Tool themes live in `proto-plugin/styles/globals.css` (import in layout). The package toggles dark/light on `[data-prototype-root]` via `data-prototype-comment-theme`.

9. **`package.json` scripts** — set dev to port 1985 and forward CLI commands to the installed package:

   ```json
   {
     "dev": "next dev -p 1985",
     "link-source": "pnpm --dir node_modules/proto-plugin link-source",
     "sync-from-source": "pnpm --dir node_modules/proto-plugin sync-from-source",
     "link-source-db": "pnpm --dir node_modules/proto-plugin link-source-db",
     "verify:prototype-ids": "pnpm --dir node_modules/proto-plugin verify:prototype-ids",
     "share-prototype": "pnpm --dir node_modules/proto-plugin share-prototype"
   }
   ```

10. **`.env.example` and `.env.local`** — document and set `SOURCE_PATH` to the source app path I provided. Add comment/screenshot storage vars only if I asked for them in step 5 — the app should run without them, but comments won't persist.

Run `pnpm dev` and confirm [http://localhost:1985](http://localhost:1985) shows the empty gallery, `/component-library` renders (empty state is fine), and the app builds cleanly before continuing.

## 3. Link the source app

The host reads the real product codebase through a read-only `source/` symlink — never import from it at runtime.

1. Copy `node_modules/proto-plugin/scripts/lib/host-config.example.sh` to **`prototype.sync.config.sh`** at the host repo root.
2. Inspect the linked source app and fill in `SYNC_FILES`, `SYNC_DIRS`, and `SYNC_GLOBS` yourself — start with design tokens and base UI (`src/app/globals.css`, `src/components/ui/`, fonts, shared utils) and add anything else the source clearly depends on. Do not ask me to confirm the list.
3. Set `SOURCE_PATH` in `.env.local` to the source app path I provided.
4. Run `pnpm link-source` — creates `source/` → source app symlink.
5. Run `pnpm sync-from-source` — copies declared paths from source into the host.
6. If I asked for local DB/API env vars, configure `SOURCE_DB_ENV_VARS` in `prototype.sync.config.sh` and run `pnpm link-source-db`.

After sync, re-check `globals.css` still includes the `@source` line for `proto-plugin`.

## 4. Ready for prototypes

When setup is done, tell me the host is ready and summarize what was synced. For building individual prototypes, read and follow **`node_modules/proto-plugin/AGENTS.md`** — that is the ground truth for prototype structure, `PrototypeComponent` ids, source fidelity, and verification (`pnpm verify:prototype-ids`).

Do not modify files inside `node_modules/proto-plugin/`. All host-specific work stays in the host repo (`prototype.config.ts`, `prototype.sync.config.sh`, `src/prototypes/`, synced design system files).
````

## Agent instructions

See [`AGENTS.md`](./AGENTS.md) — ground truth for building prototypes with this tool.
