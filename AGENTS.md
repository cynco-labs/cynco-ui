# AGENTS.md — working in the Cynco UI repo

Guidance for coding agents and contributors. Read it before changing anything.

## Layout
- `packages/ui/src/base` — generic components (Base UI + Tailwind). Changes here affect every product; keep APIs stable.
- `packages/ui/src/layout` — layout primitives. Lists use `DataList`, KPI rows `StatGrid`/`StatTile`, toolbars `ActionBar`, tab rows `ScrollRow`. Never hand-roll these in a component.
- `packages/ui/src/productivity`, `documents`, `accounting` — Cynco-specific components built from the above.
- `packages/ui/src/lib` — `money.ts` (decimal-safe maths) and `shared.tsx` (formatters, `DocStatus`, the barrel other files import from).
- `packages/ui/src/documents/labels.ts` — every printed label in English and Bahasa Melayu. Add keys here, never in a document file.
- `packages/ui/registry` — generated (`pnpm registry`); `meta.json` is the editable source for names, categories and docs text. `props.json` is generated from the TypeScript source (`scripts/extract-props.mjs`): document a prop with JSDoc on its declaration and its default in the destructuring, and the props table follows.
- `packages/ui/skills/cynco-ui/SKILL.md` — the agent skill shipped in the package and served at `/skill.md`. Keep its rules in step with the ones below.
- `apps/docs/src/demos/<Name>.tsx` — one demo per component; it is both the live preview and the code shown on the site. Import only from what a reader installs (`@cynco-labs/ui`, `react`, `@phosphor-icons/react`…). For playground knobs, `export const controls = { key: { label, options, default } | { label, default: boolean } }` and take each key as a parameter of the default export; controls named `locale` or `density` follow the site settings. `pnpm registry` fails on a demo that breaks either rule.

## Rules
1. **Tokens only.** Colours, radii and shadows come from the theme (`bg-card`, `text-muted-foreground`, `border-border`, `text-error-text`…). No hex values or Tailwind palette colours in components, except chart fills via `var(--chart-series-N)`.
2. **Type scale.** `text-2xs` 11 · `text-xs` 12 · `text-sm` 13 · `text-md` 15 · `text-lg` 17 · `text-xl` 20. No `text-[13px]`.
3. **Responsive by container.** Roots set `@container`; use `@sm:`…`@3xl:` variants. Every component must work from 320px to a full page of its own width. No fixed pixel layouts.
4. **Composable.** Every exported component accepts `className` (merged with `cn()`) and spreads native props on its root. Stateful components support controlled and uncontrolled use (`value` / `defaultValue` / `onValueChange`).
5. **Money.** Amounts are decimal strings (`"1234.50"`), never floats. Use `parseAmount`, `sumAmounts`, `toSen`/`fromSen`, `formatCurrency`. Documents print totals exactly as given and never recalculate posted figures.
6. **Accessibility.** Keyboard-operable, visible `focus-visible` rings, `aria-label` on icon-only buttons, status never by colour alone (`StatusChip` pairs a square, glyph and word).
7. **Documents are black ink.** No colour, tints or filled bars on printed documents; hierarchy from type, spacing and hairlines.
8. **Unique export names** across the whole package (`src/index.ts` re-exports everything).

## Checks before you finish
```bash
pnpm build:ui        # vite + d.ts + CSS
pnpm typecheck
pnpm registry        # if you added or renamed a component
pnpm --filter @cynco-labs/docs build
```
Then open the component's docs page (`pnpm dev`) in light and dark, at desktop and phone width.
