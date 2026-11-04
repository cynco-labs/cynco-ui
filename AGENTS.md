# AGENTS.md — working in the Cynco UI repo

Guidance for coding agents and contributors. Read it before changing anything.

## Layout
- `packages/ui/src/base` — generic components (Base UI + Tailwind). Changes here affect every product; keep APIs stable.
- `packages/ui/src/layout` — layout primitives, one per file behind an `index.ts` barrel. Lists use `DataList`, KPI rows `StatGrid`/`StatTile`, toolbars `ActionBar`, tab rows `ScrollRow`. Never hand-roll these in a component.
- `packages/ui/src/productivity`, `documents`, `accounting` — Cynco-specific components built from the above. A group that outgrows one file becomes a folder of one component each with an `index.ts` barrel at the old path, so the import never changes (`productivity/entry`, `navigation`, `workflow`).
- `packages/ui/src/lib` — `money.ts` (decimal-safe maths), `shared.tsx` (formatters, `DocStatus`, the barrel other files import from), `keyboard.ts` (`isMac`, `hasModKey`, `matchesCombo`, `isTypingTarget` — one definition each, so a shortcut behaves the same wherever it is bound).
- `packages/ui/src/documents/labels.ts` — every printed label in English and Bahasa Melayu. Add keys here, never in a document file.
- `packages/ui/registry` — generated (`pnpm registry`); `meta.json` is the editable source for names, categories and docs text. `props.json` is generated from the TypeScript source (`scripts/extract-props.mjs`): document a prop with JSDoc on its declaration and its default in the destructuring, and the props table follows.
- `packages/ui/skills/cynco-ui/SKILL.md` — the agent skill shipped in the package and served at `/skill.md`. Keep its rules in step with the ones below.
- `apps/docs/src/demos/<Name>.tsx` — one demo per component; it is both the live preview and the code shown on the site. Import only from what a reader installs (`@cynco-labs/ui`, `react`, `@phosphor-icons/react`…). For playground knobs, `export const controls = { key: { label, options, default } | { label, default: boolean } }` and take each key as a parameter of the default export; controls named `locale` or `density` follow the site settings. `pnpm registry` fails on a demo that breaks either rule. Demos are typechecked with the package (`pnpm typecheck`, strict): annotate demo data with the exported types rather than untyped helpers.

## Rules
1. **Tokens only.** Colours, radii and shadows come from the theme (`bg-card`, `text-muted-foreground`, `border-border`, `text-error-text`…). No hex values or Tailwind palette colours in components, except chart fills via `var(--chart-series-N)`. A new colour is declared once in `styles/tokens.css` and exposed in `styles/theme.css`'s `@theme inline`; a component never carries the value.
2. **Type scale.** `text-2xs` 11 · `text-xs` 12 · `text-sm` 13 · `text-md` 15 · `text-lg` 17 · `text-xl` 20, and `text-display` 28 for a hero figure only. No `text-[13px]`.
3. **Responsive by container.** Roots set `@container`; use `@sm:`…`@3xl:` variants. Every component must work from 320px to a full page of its own width. No fixed pixel layouts.
4. **Composable.** Every exported component accepts `className` (merged with `cn()`) and spreads native props on its root; a provider and a component that renders a fragment rather than an element are the exceptions. Stateful components support controlled and uncontrolled use (`value` / `defaultValue` / `onValueChange`) through `useControllableState` (base/hooks), never a hand-rolled copy. Buttons come in three sizes (`sm`, `md`, `icon`), a form field is `Field` + `FieldLabel` + `FieldControl` + `FieldError`, text entry carries `touch:text-base`, and stacking order comes from `z-sticky` / `z-sheet` / `z-dialog` / `z-popover` / `z-tooltip`.
5. **Money.** Amounts are decimal strings (`"1234.50"`), never floats. Use `parseAmount`, `sumAmounts`, `toSen`/`fromSen`, `formatCurrency`. Documents print totals exactly as given and never recalculate posted figures.
6. **Accessibility.** Keyboard-operable, visible `focus-visible` rings, controls revealed on hover also take `no-hover:opacity-100` so touch screens show them, `aria-label` on icon-only buttons, status never by colour alone (`StatusChip` pairs a square, glyph and word).
7. **Documents are black ink.** No colour, tints or filled bars on printed documents; hierarchy from type, spacing and hairlines. They have their own tokens — `text-doc-ink`, `text-doc-ink-muted`, `text-doc-ink-subtle`, `border-doc-rule` (the rule that closes a table), `border-doc-rule-soft` (the hairline), `bg-doc-paper`, `bg-doc-paper-tint` — declared on a plain `:root` and never redefined under `.dark`, because a document is paper in every theme.
8. **Unique export names** across the whole package (`src/index.ts` re-exports everything).

## Checks before you finish
```bash
pnpm lint            # Biome: format, imports, a11y, no `any` (`pnpm lint:fix` applies the safe fixes)
pnpm check:classes   # rules 1-3 above, enforced against every className in packages/ui/src
pnpm build:ui        # vite + d.ts + CSS
pnpm typecheck
pnpm registry        # if you added or renamed a component
pnpm --filter @cynco-labs/docs build
```
Then open the component's docs page (`pnpm dev`) in light and dark, at desktop and phone width.

`check:classes` reads class lists out of every `.tsx` under `packages/ui/src` and fails on hex colours, Tailwind
palette colours, `text-[13px]`, `!important` utilities, the pre-token `text-main` scale, viewport breakpoints
(`md:` — use `@md:`; printed documents are exempt), `transition-all`, and `@container` on a box that shrinks to its
content (`w-fit`, `inline-flex`…), which measures zero and collapses it. A genuinely justified exception goes in
`scripts/check-classes.allow` as `path:pattern # reason`; the reason is required and a stale entry fails the check.
The rules themselves live in `packages/ui/bin/rules.mjs`, shared with the published `npx cynco-ui check` that apps
run. Change a rule there and it changes for both; only the pre-token scale and the document exemption are local to
`scripts/check-classes.mjs`.
