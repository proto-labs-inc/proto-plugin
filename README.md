# Proto

Source repository for **`@maayanalbert/prototype`** — a Next.js framework for building shareable UI prototypes that look and feel like the real product.

Host apps install the package, register prototypes in `prototype.config.ts`, and keep project-specific UI under `src/prototypes/`. The package provides the reusable tooling: review shell, anchored comments, variant exploration, a prototype gallery, source-app sync scripts, and Vercel preview sharing.

## What's in this repo

| Path | Description |
| --- | --- |
| [`packages/prototype/`](packages/prototype/) | The publishable `prototype` package — shell, comment system, gallery, config helpers, and CLI scripts |
| [`packages/prototype/README.md`](packages/prototype/README.md) | Install, host setup, public API, and script reference |
| [`packages/prototype/AGENTS.md`](packages/prototype/AGENTS.md) | Ground truth for AI agents building prototypes in host apps |

## Quick start

In a host Next.js app, add the package and follow the setup steps in the package README — register prototypes, wire gallery and slug routes, and configure Tailwind to scan package components.

```bash
pnpm add @maayanalbert/prototype
```

See [`packages/prototype/README.md`](packages/prototype/README.md) for the full host setup checklist.
