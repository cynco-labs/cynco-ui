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
5. `pnpm changeset` and write one line a product engineer would understand. **Ask the maintainer which bump it gets (patch or minor) before you choose**: the release goes out at the highest bump pending, so one `minor` makes the whole release a minor.

## Releasing
Every push to `main` runs CI and the Release workflow. While changesets are pending, Release opens or updates a
**Version Packages** PR that bumps `packages/ui/package.json` and writes `CHANGELOG.md`. Confirm its version with the
maintainer before merging. Merging it runs Release again, which publishes to npm from CI with trusted publishing (no
token), and a published version can never be reused.

Two repo settings this depends on: GitHub Actions must be allowed to create pull requests (Settings → Actions →
General), and `@cynco-labs/ui` must list this repo's `release.yml` as a trusted publisher on npmjs.com. Until both
are on, open the Version Packages PR from the `changeset-release/main` branch by hand and publish with
`npm publish --access public` from `packages/ui` after `pnpm build:ui`.

The docs site deploys separately: `pnpm build:ui && pnpm --filter @cynco-labs/docs build`, then
`npx wrangler deploy` from `apps/docs`.
