import components from "@cynco-labs/ui/registry/components.json";

export interface PropDef {
	name: string;
	type: string;
	required: boolean;
	default?: string;
	description?: string;
}

/** One row of a component's keyboard table. */
export interface KeyRow {
	/** Keycaps as a reader presses them: "Enter", "Arrow Up / Arrow Down", "⌘K / Ctrl+K". */
	keys: string;
	does: string;
}

/** The Accessibility section: the keyboard table, then what a screen reader hears. */
export interface A11y {
	keys: KeyRow[];
	screenReader: string;
}

/** Props declared in our source; `inherits` names the native or Base UI props passed through. */
export interface PropTable {
	props: PropDef[];
	inherits: string[];
}

export interface RegistryEntry {
	name: string;
	slug: string;
	category: string;
	group: string;
	summary: string;
	use: string;
	provide: string;
	notes: string;
	/** From registry/meta.json; null until a component's keyboard and ARIA behaviour is written down. */
	a11y: A11y | null;
	sourcePath: string;
	/** 1-based, inclusive line span of this component in `sourcePath`; 0 when it could not be found. */
	sourceStart: number;
	sourceEnd: number;
	demoPath: string;
	importFrom: string;
	height: number;
	/** Generated from the TypeScript source by scripts/extract-props.mjs; null for hooks and utilities. */
	props: PropTable | null;
}

export const registry = components as RegistryEntry[];

export const CATEGORIES = [
	{
		name: "Layout",
		blurb:
			"Responsive primitives every screen is built from: lists that stack, KPI rows that auto-fit, toolbars that wrap.",
	},
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
