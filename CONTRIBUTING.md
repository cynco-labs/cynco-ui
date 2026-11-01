# Contributing

## Setup
```bash
pnpm install
pnpm dev          # docs on http://localhost:4321
```
Node 22 (`.nvmrc`) and pnpm 9.

## Adding a component
1. Write it in the right folder of `packages/ui/src` (see [AGENTS.md](AGENTS.md)) and export it from that file; make sure `src/index.ts` re-exports the file.
2. Add an entry to `packages/ui/registry/meta.json` (name, category, group, summary, use, provide, notes).
3. Add a demo at `apps/docs/src/demos/<Name>.tsx` (`export default function <Name>Demo()`), using realistic Malaysian sample data (RM amounts, `INV-2026-0142`, account codes like `1000-001`).
4. `pnpm registry && pnpm build` and check the new page in light and dark, desktop and phone.
5. `pnpm changeset` — choose the bump (patch for fixes, minor for new components, major for breaking API changes) and write one line a product engineer would understand.

## Releasing
Merging to `main` runs CI. To publish: `pnpm release` (builds the package and runs `changeset publish`). Versions and `CHANGELOG.md` come from the changesets.
