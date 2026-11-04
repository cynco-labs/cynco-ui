import { GUIDES } from "./nav";
import { byCategory, CATEGORIES, registry } from "./registry";

/**
 * Live demos on the home page, in grid order. At three columns the grid is 7 rows with no holes:
 * 7 small (1 cell) + 3 wide (2) + 2 large (4) = 21 cells. `right` pins a wide or large tile to the
 * right two columns; the dense flow backfills column 1. Re-balance when adding a tile.
 */
export const SHOWCASE: { name: string; size: "small" | "wide" | "large"; right?: boolean; note: string }[] = [
	{ name: "DataList", size: "large", note: "Try Density above" },
	{ name: "AmountInput", size: "small", note: "Decimal-safe" },
	{ name: "StatusChip", size: "small", note: "Never colour alone" },
	{ name: "BankFeedRow", size: "wide", note: "Reconcile a line" },
	{ name: "Calendar", size: "small", note: "Keyboard first" },
	{ name: "TaxInvoiceDocument", size: "large", right: true, note: "Try Documents above" },
	{ name: "InvoiceTotalsPanel", size: "small", note: "Tabular figures" },
	{ name: "PromptInput", size: "small", note: "@cynco-labs/ui/ai" },
	{ name: "KpiTileGrid", size: "wide", note: "Auto-fits its container" },
	{ name: "Conversation", size: "small", note: "@cynco-labs/ui/ai" },
	{ name: "JournalGrid", size: "wide", note: "Spreadsheet-fast entry" },
	{ name: "BankMatchReview", size: "small", note: "Match suggestions" },
];

export const PRINCIPLES = [
	{
		title: "Quiet by default",
		body:
			"Neutral surfaces and four steps of text. One blue does the pointing; colour appears only when it carries meaning.",
	},
	{
		title: "Dense, not cramped",
		body:
			"13px type, 28px controls and tight rows, so a ledger or a bank feed fits on one screen without feeling crowded.",
	},
	{
		title: "Responsive to its container",
		body: "Components use container queries, so the same list works in a page, a side sheet and on a phone.",
	},
	{
		title: "Money is exact",
		body: "Amounts are decimal strings, maths is done in sen, figures are tabular and right-aligned and never truncate.",
	},
	{
		title: "Keyboard first",
		body: "Spreadsheet-fast journal entry, ⌘K everywhere, visible shortcuts and Undo instead of “Are you sure?”.",
	},
	{
		title: "Black ink on paper",
		body: "Invoices, statements and reports print in black ink at real paper sizes, in English, Malay or both.",
	},
];

export function homeMarkdown() {
	const l = [
		"# Cynco UI",
		"",
		"The design system for accounting and ERP software: quiet, dense React components for ledgers, invoices, bank feeds and printed documents, built with Base UI and Tailwind CSS v4. Package: `@cynco-labs/ui` (AI components in `@cynco-labs/ui/ai`).",
		"",
		"```bash",
		"pnpm add @cynco-labs/ui @phosphor-icons/react",
		"```",
		"",
		"```css",
		'@import "tailwindcss";',
		'@import "@cynco-labs/ui/theme.css";',
		"```",
		"",
		`## Components (${registry.length})`,
		"",
		...CATEGORIES.map(
			(c) =>
				`- **${c.name}** (${byCategory(c.name).length}): ${c.blurb} See [/components#${c.name.toLowerCase()}](/components.md).`,
		),
		"",
		"## Principles",
		"",
		...PRINCIPLES.map((p) => `- **${p.title}.** ${p.body}`),
		"",
		"## Guides",
		"",
		...GUIDES.flatMap((g) =>
			g.items.filter((i) => i.href !== "/").map((i) => `- [${i.label}](${i.href}.md): ${i.description}`),
		),
		"",
	];
	return l.join("\n");
}
