# Cynco UI

Cynco's design system for accounting and ERP interfaces: base components, layout primitives, productivity patterns, printable business documents and accounting screens, built on React 19, Base UI and Tailwind CSS v4.

- **Package:** [`@cynco-labs/ui`](packages/ui)
- **Docs:** [`apps/docs`](apps/docs) (run locally with `pnpm dev`, http://localhost:4321)

## Quick start

```bash
pnpm add @cynco-labs/ui @phosphor-icons/react react react-dom
```

```css
/* app.css */
@import "tailwindcss";
@import "@cynco-labs/ui/fonts.css"; /* optional: Inter, JetBrains Mono, Geist, Newsreader */
@import "@cynco-labs/ui/theme.css";
```

```tsx
import { Button, DataList, formatCurrency } from "@cynco-labs/ui";

export function Invoices({ rows }) {
	return (
		<DataList
			rows={rows}
			getKey={(r) => r.id}
			columns={[
				{ key: "no", header: "Invoice #", mobile: "title", nowrap: true, cell: (r) => r.number },
				{ key: "total", header: "Amount", align: "right", mobile: "value", cell: (r) => formatCurrency(r.total) },
			]}
		/>
	);
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

Money is handled as decimal strings with exact maths (`parseAmount`, `sumAmounts`), dates are timezone-safe, labels on documents come in English and Bahasa Melayu, and every component responds to the width of its container.

## Repository

```
packages/ui        @cynco-labs/ui — source, build, CLI (bin/cynco-ui.mjs), component registry
apps/docs          the docs site (Astro), one page and live demo per component
scripts/           registry generation and demo conversion
.changeset/        release notes and versioning
```

| Command | What it does |
| --- | --- |
| `pnpm install` | Install everything |
| `pnpm dev` | Docs site on http://localhost:4321 |
| `pnpm build:ui` | Build the package (`packages/ui/dist`) |
| `pnpm build` | Build the package, then the docs site |
| `pnpm registry` | Regenerate the component registry from source |
| `pnpm typecheck` | Type-check every workspace |
| `pnpm changeset` | Describe a change for the next release |

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add a component, and [AGENTS.md](AGENTS.md) for the rules coding agents follow in this repo.

## License

MIT © Cynco Sdn Bhd. Some base components are adapted from Apache-2.0 licensed code; see [NOTICE](NOTICE).
