import components from "@cynco-labs/ui/registry/components.json";

export interface RegistryEntry {
	name: string;
	slug: string;
	category: string;
	group: string;
	summary: string;
	use: string;
	provide: string;
	notes: string;
	sourcePath: string;
	demoPath: string;
	importFrom: string;
	height: number;
}

export const registry = components as RegistryEntry[];

export const CATEGORIES = [
	{ name: "Layout", blurb: "Responsive primitives every screen is built from: lists that stack, KPI rows that auto-fit, toolbars that wrap." },
	{ name: "Components", blurb: "Buttons, inputs, menus, dialogs, sheets, tables and charts on Base UI." },
	{ name: "Productivity", blurb: "Spreadsheet-fast entry, the command palette, saved views, bulk actions and undo." },
	{ name: "Documents", blurb: "Printable invoices, receipts, statements, payslips and financial reports in black ink." },
	{ name: "Accounting", blurb: "Sales, ledger, banking, reports, parties and tax screens for Malaysian businesses." },
	{ name: "AI", blurb: "Chat, reasoning, tool calls, prompt input and workflow canvas for in-product agents." },
] as const;

/** Categories whose sidebar entries are split into sub-headings by `group`. */
export const GROUPED = new Set(["Components", "Accounting"]);

export function byCategory(category: string) {
	return registry.filter((c) => c.category === category);
}

export function groupsOf(category: string) {
	const groups = new Map<string, RegistryEntry[]>();
	for (const c of byCategory(category)) {
		const list = groups.get(c.group) ?? [];
		list.push(c);
		groups.set(c.group, list);
	}
	return [...groups.entries()].map(([group, items]) => ({ group, items }));
}

export const categorySlug = (name: string) => name.toLowerCase();
