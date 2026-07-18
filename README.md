# proto-prototypes

Next.js host app for [**proto-plugin**](packages/prototype/) — shareable UI prototypes that match the real product.

## Getting started

```bash
pnpm install
pnpm dev
```

The dev server runs on port **1985** (see `"dev": "next dev -p 1985"` in `package.json`). Open [http://localhost:1985](http://localhost:1985).

## Docs

| Path | Description |
| --- | --- |
| [`packages/prototype/README.md`](packages/prototype/README.md) | Host setup, API, and scripts |
| [`AGENTS.md`](AGENTS.md) (symlink → [`packages/prototype/AGENTS.md`](packages/prototype/AGENTS.md)) | Building prototypes |

## Source app

Set `SOURCE_PATH` in `.env.local`, then:

```bash
pnpm link-source
pnpm sync-from-source
```
