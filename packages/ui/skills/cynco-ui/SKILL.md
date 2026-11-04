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

Before writing UI, look for the component that already does it. 228 exist, across Layout, Components,
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
To rebrand, override `--primary` (and `--primary` plus `--primary-text` under `.dark`) after the theme import;
hover, selection and focus tints are mixed from it. Corners follow `--radius-sm` … `--radius-2xl`.
`DensityProvider` sets row density for lists; `DocumentBrandProvider` sets company, layout and language
(`"en"`, `"ms"` or `"en-ms"`) for every document inside.

## Rules

1. **Tokens only.** Colours, radii and shadows come from the theme: `bg-card`, `bg-background`,
   `text-foreground`, `text-muted-foreground`, `text-tertiary-foreground`, `text-subtle`,
   `border-border`, `text-error-text`. No hex values, no Tailwind palette colours (`text-gray-500`,
   `bg-blue-600`). Charts use `var(--chart-series-N)`.
2. **Type scale.** `text-2xs` 11 · `text-xs` 12 · `text-sm` 13 · `text-md` 15 · `text-lg` 17 ·
   `text-xl` 20, and `text-display` 28 for a hero figure only. No arbitrary sizes like `text-[13px]`.
3. **Money is exact.** Amounts are decimal strings (`"1234.50"`), never floats. Add with
   `sumAmounts`, convert with `toSen`/`fromSen`, parse input with `parseAmount`, display with
   `formatCurrency`. Use `AmountInput` for entry. Figures are tabular and right-aligned.
4. **Use the primitives.** Lists of records use `DataList` (it turns into stacked cards on narrow
   containers). KPI rows use `StatGrid` + `StatTile`. Toolbars use `ActionBar`. Tab rows use
   `ScrollRow`. Grouped content uses `SectionPanel`; label/value pairs use `KeyValueList`. Don't
   hand-build `<table>` markup or flex rows for these.
5. **Responsive by container.** Components size to their container with container queries and work
   from 320px up. Don't wrap them in fixed pixel widths; give the parent the width instead. Reach for
   the container variants `@sm:`…`@3xl:`, not the viewport ones (`md:`), so a component laid out in a
   sidebar reads the sidebar's width rather than the window's.
6. **Status is never colour alone.** Use `StatusChip`, which pairs a shape, a glyph and a word.
7. **Documents are black ink.** Invoices, receipts, statements, payslips and reports print in black on
   white: no colour, tints or filled bars. Pass totals exactly as posted; documents never recalculate.
   Labels come from the kit's English/Malay dictionary through `DocumentBrandProvider`'s locale. Their
   own tokens are `text-doc-ink`, `text-doc-ink-muted`, `text-doc-ink-subtle`, `border-doc-rule` (the
   rule that closes a table), `border-doc-rule-soft` (the hairline), `bg-doc-paper` and
   `bg-doc-paper-tint`. They are the same in every theme, so a document on a dark page still prints as
   paper; never redefine them under `.dark`.
8. **Accessibility.** Icon-only buttons get `aria-label`. Keep the visible focus ring. A control revealed on
   hover also takes `no-hover:opacity-100`, so touch screens show it. Prefer Undo (`useUndoToast`) to
   "Are you sure?" dialogs for reversible bulk actions.
9. **Composable.** Every component takes `className` (merged, so your classes win) and native props on
   its root. Stateful ones support `value`/`defaultValue`/`onValueChange`. Because they already win,
   you never need `!` to force one through (`!px-2`, `px-2!`); reaching for it means the override
   belongs somewhere else. Animate the properties that change (`transition-colors`), not
   `transition-all`.
10. **One way to do each thing.** Buttons come in three sizes, `sm` (24px, dense rows), `md` (28px,
   lines up with an `Input`) and `icon` (24px square); there is no other size. A form field is
   `Field` wrapping `FieldLabel`, an optional `FieldDescription`, `FieldControl` and `FieldError`,
   which owns the `id`, `aria-describedby` and `aria-invalid` wiring so it cannot be forgotten. Text
   entry carries `touch:text-base`, because iOS Safari zooms the page into a field under 16px and
   never zooms back out. Stacking order comes from `z-sticky`, `z-sheet`, `z-dialog`, `z-popover` and
   `z-tooltip`, not from a number you pick. A layout that changes structure, rather than styling,
   measures its own box with `useContainerWidth`.

## Names that moved

Older code and older answers reach for these. They are gone; use the one on the right.

| Was | Now |
| --- | --- |
| `FormLabel`, `LabelInput`, the old `FieldLabel` | `Field` with `FieldLabel` and `FieldControl` |
| `TextCheckbox` | `Checkbox` with its own label |
| `IconCheckbox` | `ToggleButton` |
| `CopyIconButton`, `MiniCopyButton`, `CopyTextButton` | `CopyButton` with `variant="icon"`, `"inline"` or `"text"` |
| `IconTooltipButton` | `IconButton` with its `tooltip` prop |
| `SheetCloseButton` | `SheetClose` |
| `CursorPagination`, `PageSizeSelector`, `TablePaginationFooter` | `DataTable.Pagination` |
| `useIsMobile` | `useContainerWidth` (a component reads its own box, never the window) |

## Before you finish

Check the screen at a narrow width (about 360px) and in dark mode. Search the diff for hex colours,
Tailwind palette colours (`text-blue-500`), `text-[`, viewport breakpoints (`md:` where `@md:` was
meant), `!` important utilities, `transition-all`, `parseFloat`/`Number(` on amounts and hand-built
`<table>`s; each is usually a rule above being broken. In this repo, `pnpm lint` and
`pnpm check:classes` check all of that for you.
