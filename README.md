# Cynco UI

Cynco's design system for accounting and ERP interfaces: base components, layout primitives, productivity patterns, printable business documents and accounting screens, built on React 19, Base UI and Tailwind CSS v4.

- **Docs and live demos:** [ui.cynco.io](https://ui.cynco.io)
- **Package:** [`@cynco-labs/ui` on npm](https://www.npmjs.com/package/@cynco-labs/ui) ([source](packages/ui))

## Quick start

```bash
pnpm add @cynco-labs/ui @phosphor-icons/react react react-dom
```

```css
/* app.css */
@import "tailwindcss";
@import "@cynco-labs/ui/fonts.css"; /* optional: Inter, JetBrains Mono, Geist, Geist Mono, Newsreader */
@import "@cynco-labs/ui/theme.css";
```

```tsx
import { type DataColumn, DataList, formatCurrency } from "@cynco-labs/ui";

type Invoice = { id: string; number: string; total: string };

const columns: DataColumn<Invoice>[] = [
	{ key: "no", header: "Invoice #", mobile: "title", nowrap: true, cell: (r) => r.number },
	{ key: "total", header: "Amount", align: "right", mobile: "value", cell: (r) => formatCurrency(r.total) },
];

export function Invoices({ rows }: { rows: Invoice[] }) {
	return <DataList rows={rows} columns={columns} getKey={(r) => r.id} />;
}
```

Not using Tailwind? Import the precompiled stylesheet instead: `import "@cynco-labs/ui/styles.css"`.

## What's inside

| Area | Highlights |
| --- | --- |
| Components | Button, Input, Select, Combobox (Command), Dialog, Sheet, Popover, Tabs, Table/DataTable, StatusChip, Charts |
| Layout | DataList, StatGrid/StatTile, SectionPanel, KeyValueList, ActionBar, ScrollRow, DensityProvider, Kbd, useHotkey |
| Productivity | JournalGrid, AmountInput, InlineEditCell, CommandPalette, ShortcutsDialog, SavedViewsBar, BulkActionBar, UndoToast |
| Documents | Document kit (A4/A5/80mm), tax invoice, quotation, credit/debit note, receipt, delivery order, PO, payment voucher, statement, payslip, financial reports, DocumentStudio |
| Accounting | Invoicing, ledger and journals, banking and reconciliation, reports, parties, tax, assets, inventory, payroll |
| AI (`@cynco-labs/ui/ai`) | Conversation, Message, PromptInput, Reasoning, Tool, Plan, workflow Canvas |

Money is handled as decimal strings with exact maths (`parseAmount`, `sumAmounts`), calendar dates (`"2026-10-30"`) never shift a day across time zones, labels on documents come in English and Bahasa Melayu, and every component responds to the width of its container.

## Repository

```
packages/ui        @cynco-labs/ui — source, build, CLI (bin/cynco-ui.mjs), component registry
apps/docs          the docs site (Astro), one page and live demo per component
scripts/           registry generation, the class checker and the preview-image renderer
.changeset/        release notes and versioning
```

| Command | What it does |
| --- | --- |
| `pnpm install` | Install everything |
| `pnpm dev` | Docs site on http://localhost:4321 |
| `pnpm lint` | Biome: format, imports, a11y, no `any` |
| `pnpm check:classes` | The class-name rules (theme tokens, type scale, container queries) across `packages/ui/src` |
| `pnpm test` | Unit and interaction tests |
| `pnpm build:ui` | Build the package (`packages/ui/dist`) |
| `pnpm build` | Build the package, then the docs site (its preview images need Google Chrome or Chromium) |
| `pnpm registry` | Regenerate the component registry from source |
| `pnpm typecheck` | Type-check every workspace |
| `pnpm changeset` | Describe a change for the next release (ask the maintainer which bump first) |

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add a component and how releases work, and [AGENTS.md](AGENTS.md) for the rules coding agents follow in this repo.

## Using it with a coding agent

In a project that depends on the package, `npx cynco-ui skill` installs the agent skill and `npx cynco-ui check` checks the agent's work against the same rules the components follow. The docs are also published for models: [llms.txt](https://ui.cynco.io/llms.txt), [llms-full.txt](https://ui.cynco.io/llms-full.txt), and Markdown for every page at `<url>.md`.

## License

MIT © Cynco Sdn Bhd. Some base components are adapted from Apache-2.0 licensed code; see [NOTICE](NOTICE).
