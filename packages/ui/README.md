# @cynco-labs/ui

[![npm](https://img.shields.io/npm/v/@cynco-labs/ui)](https://www.npmjs.com/package/@cynco-labs/ui)
[![license](https://img.shields.io/npm/l/@cynco-labs/ui)](https://github.com/cynco-labs/cynco-ui/blob/main/packages/ui/LICENSE)

Quiet, dense React components for accounting and ERP software: ledgers, invoices, bank feeds, payroll, tax, and
printable business documents in English and Malay. React 19, Base UI, Tailwind CSS v4.

**Docs and live demos: [ui.cynco.io](https://ui.cynco.io)**

## Install

```bash
pnpm add @cynco-labs/ui @phosphor-icons/react react react-dom
```

```css
/* app.css */
@import "tailwindcss";
@import "@cynco-labs/ui/fonts.css"; /* optional: Inter, JetBrains Mono, Geist, Geist Mono, Newsreader */
@import "@cynco-labs/ui/theme.css";
```

Not using Tailwind? Import the precompiled stylesheet once instead: `import "@cynco-labs/ui/styles.css";`

## Use

```tsx
import { type DataColumn, DataList, formatCurrency, StatusChip } from "@cynco-labs/ui";

type Invoice = { id: string; number: string; customer: string; total: string; paid: boolean };

const columns: DataColumn<Invoice>[] = [
	{ key: "no", header: "Invoice #", mobile: "title", nowrap: true, cell: (r) => r.number },
	{ key: "customer", header: "Customer", cell: (r) => r.customer },
	{
		key: "status",
		header: "Status",
		mobile: "badge",
		cell: (r) =>
			r.paid ? (
				<StatusChip tone="green" glyph="check">Paid</StatusChip>
			) : (
				<StatusChip tone="amber" glyph="clock">Pending</StatusChip>
			),
	},
	{ key: "total", header: "Amount", align: "right", mobile: "value", cell: (r) => formatCurrency(r.total) },
];

export function Invoices({ rows }: { rows: Invoice[] }) {
	return <DataList rows={rows} columns={columns} getKey={(r) => r.id} />;
}
```

`DataList` is a table on a wide container and one stacked card per row on a narrow one. Amounts are decimal strings
(`"12850.00"`), never floats: `formatCurrency` prints them, `sumAmounts` and `parseAmount` do exact maths.

Wrap the app once in `TooltipProvider` so tooltips share a delay, and in `UndoToastProvider` if you use
`useUndoToast()`.

## Themes

Light by default. Add `class="dark"` or `data-theme="dark" | "modern" | "modern-dark"` on a parent. To rebrand,
override `--primary` after the theme import.

## AI components

Chat, reasoning, tool-call and workflow components live at `@cynco-labs/ui/ai`, so apps that don't use them never
install their dependencies:

```bash
pnpm add ai streamdown shiki use-stick-to-bottom tokenlens nanoid @xyflow/react
```

```tsx
import { Conversation, Message, PromptInput } from "@cynco-labs/ui/ai";
```

## CLI

```bash
npx cynco-ui search bank reconciliation   # find a component
npx cynco-ui docs amount-input            # its docs, typed props and an example, offline
npx cynco-ui check                        # your code against the library's rules
npx cynco-ui skill                        # install the agent skill
```

## For coding agents

- `npx cynco-ui skill` installs the skill at `.claude/skills/cynco-ui/SKILL.md`: the house rules (theme tokens,
  decimal-string money, the layout primitives, black-ink documents) and where to look things up.
- `npx cynco-ui check` fails on hex and palette colours, arbitrary type sizes, `!important` utilities,
  `transition-all` and floats on amounts, so an agent can check its own work.
- Every docs page has Markdown at `<url>.md`; [ui.cynco.io/llms.txt](https://ui.cynco.io/llms.txt) indexes them and
  [ui.cynco.io/llms-full.txt](https://ui.cynco.io/llms-full.txt) is the whole reference in one file.

## License

MIT. Some base components are adapted from Apache-2.0 licensed code; see [NOTICE](NOTICE).
