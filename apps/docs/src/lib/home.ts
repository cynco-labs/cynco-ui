import { CATEGORIES, byCategory, registry } from "./registry";
import { GUIDES } from "./nav";

export const PRINCIPLES = [
	{ title: "Quiet by default", body: "Neutral surfaces and four steps of text. One blue does the pointing; colour appears only when it carries meaning." },
	{ title: "Dense, not cramped", body: "13px type, 28px controls and tight rows, so a ledger or a bank feed fits on one screen without feeling crowded." },
	{ title: "Responsive to its container", body: "Components use container queries, so the same list works in a page, a side sheet and on a phone." },
	{ title: "Money is exact", body: "Amounts are decimal strings, maths is done in sen, figures are tabular and right-aligned and never truncate." },
	{ title: "Keyboard first", body: "Spreadsheet-fast journal entry, ⌘K everywhere, visible shortcuts and Undo instead of “Are you sure?”." },
	{ title: "Black ink on paper", body: "Invoices, statements and reports print in black ink at real paper sizes, in English, Malay or both." },
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
		...CATEGORIES.map((c) => `- **${c.name}** (${byCategory(c.name).length}): ${c.blurb} See [/components#${c.name.toLowerCase()}](/components.md).`),
		"",
		"## Principles",
		"",
		...PRINCIPLES.map((p) => `- **${p.title}.** ${p.body}`),
		"",
		"## Guides",
		"",
		...GUIDES.flatMap((g) => g.items.filter((i) => i.href !== "/").map((i) => `- [${i.label}](${i.href}.md): ${i.description}`)),
		"",
	];
	return l.join("\n");
}
