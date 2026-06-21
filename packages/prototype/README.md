# prototype

Shared framework for building shareable UI prototypes in Next.js — review shell, comment anchoring, variant exploration, and the prototype home gallery.

Host apps keep **project-specific** code: prototypes under `src/prototypes/`, design tokens in `globals.css`, synced `@/components/ui`, and styleguide pages. The `prototype` package owns everything reusable across projects.

## Install (workspace)

In a pnpm monorepo:

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
```

```json
{
  "dependencies": {
    "prototype": "workspace:*"
  }
}
```

## Host setup

1. **Register prototypes** in `prototype.config.ts` at the repo root:

```ts
import { definePrototypeConfig } from "prototype";
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
import { createPrototypeGalleryPage } from "prototype";
import prototypeConfig from "../../../prototype.config";

export default createPrototypeGalleryPage(prototypeConfig);
```

3. **Prototype route** — `src/app/(source-prototype)/prototypes/[slug]/page.tsx`:

```tsx
import { createPrototypePage } from "prototype";
import prototypeConfig from "../../../../../prototype.config";

const page = createPrototypePage(prototypeConfig);
export default page.default;
export const generateStaticParams = page.generateStaticParams;
```

4. **Next.js config** — transpile the package (use a relative import so CSS is not loaded during config evaluation):

```ts
import { withPrototype } from "./packages/prototype/src/config/with-prototype";

export default withPrototype({ nextConfig: { /* … */ } });
```

5. **Tailwind** — scan prototype package components from the host `globals.css`:

```css
@import "tailwindcss";
@source "../../packages/prototype/src/**/*.{js,ts,jsx,tsx}";
```

6. **tsconfig paths** (optional, for tool internal `@prototype/*` alias when developing the package):

```json
{
  "compilerOptions": {
    "paths": {
      "prototype": ["./packages/prototype/src/index.ts"],
      "prototype/server": ["./packages/prototype/src/server.ts"]
    }
  }
}
```

## Public API

| Export | Use |
| --- | --- |
| `definePrototypeConfig` | Register prototypes (sets global config as a side effect) |
| `createPrototypePage` | Factory for `/prototypes/[slug]` page + `generateStaticParams` |
| `createPrototypeRegistry` | Server helpers: `getAllPrototypes`, `getPrototype`, … |
| `PrototypeComponent`, `PrototypeControl` | Comment-anchorable UI wrappers |
| `PrototypeShell` | Review chrome (comments sidebar, screenshot capture) |
| `PrototypeVariantExplorer` | Multi-variant design exploration |
| `usePrototypeComments` | Live state + comment restore |
| `PrototypeGalleryClient` | Card grid for prototype home |
| `PrototypeGalleryShell`, `PrototypeGalleryHeader`, `PrototypeGalleryPage` | Tool-styled gallery layout (wrap in host route at `/`) |
| `definePrototypeComponentRegistry` | Per-prototype component id registry |

**Server-only** (import from `prototype/server`):

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

## Agent instructions

See [`AGENTS.md`](./AGENTS.md) — ground truth for building prototypes with this tool.
