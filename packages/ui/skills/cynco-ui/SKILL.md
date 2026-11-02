---
name: cynco-ui
description: >-
  Build accounting and ERP screens with Cynco UI (@cynco-labs/ui): quiet, dense React components for
  ledgers, invoices, bank feeds, payroll, tax and printable business documents in English and Malay.
  Use whenever the project depends on @cynco-labs/ui, the user mentions Cynco UI or ui.cynco.io, or asks
  for an invoice, quotation, receipt, statement, payslip, financial report, journal entry, bank
  reconciliation or similar screen in a project that has it installed. Also use before hand-writing a
  table, KPI row, toolbar, money input or currency formatting there, so the code uses the library's
  primitives and money helpers instead of inventing its own.
---

# Cynco UI

One package, `@cynco-labs/ui`, React 19 + Base UI + Tailwind CSS v4. AI chat and workflow components
import from `@cynco-labs/ui/ai`. Docs with live demos: <https://ui.cynco.io>.

## Find the right component first

Before writing UI, look for the component that already does it. 234 exist, across Layout, Components,
Productivity, Documents, Accounting and AI.

- Offline, in a project with the package installed: `npx cynco-ui search <words>`, then
  `npx cynco-ui docs <Name>` for the summary, import, a full example, typed props and design notes.
- Online: <https://ui.cynco.io/llms.txt> lists every page; each component's Markdown is at
  `https://ui.cynco.io/components/<slug>.md`.

Read the component's docs before using it. The example in the docs is the intended composition.

## Setup

```bash
pnpm add @cynco-labs/ui @phosphor-icons/react
```

```css
@import "tailwindcss";
@import "@cynco-labs/ui/fonts.css";
@import "@cynco-labs/ui/theme.css";
```

Without Tailwind, `import "@cynco-labs/ui/styles.css"` once at the root. Wrap the app once in
`<TooltipProvider>`. Dark mode is the `dark` class on `<html>`; the Modern theme adds `preset-modern`.
`DensityProvider` sets row density for lists; `DocumentBrandProvider` sets company, layout and language
(`"en"`, `"ms"` or `"en-ms"`) for every document inside.

## Rules

1. **Tokens only.** Colours, radii and shadows come from the theme: `bg-card`, `bg-background`,
   `text-foreground`, `text-muted-foreground`, `text-tertiary-foreground`, `text-subtle`,
   `border-border`, `text-error-text`. No hex values, no Tailwind palette colours (`text-gray-500`,
   `bg-blue-600`). Charts use `var(--chart-series-N)`.
2. **Type scale.** `text-2xs` 11 · `text-xs` 12 · `text-sm` 13 · `text-md` 15 · `text-lg` 17 ·
   `text-xl` 20. No arbitrary sizes like `text-[13px]`.
3. **Money is exact.** Amounts are decimal strings (`"1234.50"`), never floats. Add with
   `sumAmounts`, convert with `toSen`/`fromSen`, parse input with `parseAmount`, display with
   `formatCurrency`. Use `AmountInput` for entry. Figures are tabular and right-aligned.
4. **Use the primitives.** Lists of records use `DataList` (it turns into stacked cards on narrow
   containers). KPI rows use `StatGrid` + `StatTile`. Toolbars use `ActionBar`. Tab rows use
   `ScrollRow`. Grouped content uses `SectionPanel`; label/value pairs use `KeyValueList`. Don't
   hand-build `<table>` markup or flex rows for these.
5. **Responsive by container.** Components size to their container with container queries and work
   from 320px up. Don't wrap them in fixed pixel widths; give the parent the width instead.
6. **Status is never colour alone.** Use `StatusChip`, which pairs a shape, a glyph and a word.
7. **Documents are black ink.** Invoices, receipts, statements, payslips and reports print in black on
   white: no colour, tints or filled bars. Pass totals exactly as posted; documents never recalculate.
   Labels come from the kit's English/Malay dictionary through `DocumentBrandProvider`'s locale.
8. **Accessibility.** Icon-only buttons get `aria-label`. Keep the visible focus ring. Prefer Undo
   (`useUndoToast`) to "Are you sure?" dialogs for reversible bulk actions.
9. **Composable.** Every component takes `className` (merged, so your classes win) and native props on
   its root. Stateful ones support `value`/`defaultValue`/`onValueChange`.

## Before you finish

Check the screen at a narrow width (about 360px) and in dark mode. Search the diff for hex colours,
`text-[`, `parseFloat`/`Number(` on amounts and hand-built `<table>`s; each is usually a rule above
being broken.
