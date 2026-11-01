import notes from "../data/token-notes.json";
import { readUi } from "./paths";

export const THEMES = [
	{ id: "light", label: "Light" },
	{ id: "dark", label: "Dark" },
	{ id: "modern", label: "Modern" },
	{ id: "modern-dark", label: "Modern dark" },
] as const;
export type ThemeId = (typeof THEMES)[number]["id"];

export interface ColorToken {
	name: string;
	usage: string;
	values: Record<ThemeId, string>;
}

const GROUPS: { title: string; id: string; intro: string; test: (n: string) => boolean }[] = [
	{ title: "Text", id: "text", intro: "Four steps of text, each with a purpose, plus placeholder.", test: (n) => ["foreground", "muted-foreground", "tertiary-foreground", "subtle", "placeholder"].includes(n) },
	{ title: "Surfaces", id: "surfaces", intro: "The page, the app chrome around it, cards and raised controls.", test: (n) => ["background", "outer-background", "card", "card-foreground", "interactive-secondary", "interactive-secondary-hover", "muted", "input-background"].includes(n) },
	{ title: "Primary", id: "primary", intro: "The one accent. Reach for it only for the main action, selection and focus.", test: (n) => /^(primary|primary-foreground|hover-primary|active-primary|radio-group-hover-primary|ring|sandbox|color-primary-btn-|color-muted-(hover|active)|color-focus)/.test(n) },
	{ title: "Borders and inputs", id: "borders", intro: "Hairlines everywhere by default; inputs get their own border colour.", test: (n) => /^(border|border-sheet|border-table|card-border|input|input-border-|switch-thumb-on|scrollbar-thumb|icon1)$/.test(n) || n.startsWith("input-border") },
	{ title: "Overlays", id: "overlays", intro: "Popovers, menus, selects and dialogs.", test: (n) => n.startsWith("overlay") },
	{ title: "Tables", id: "tables", intro: "A recessed tray holds a raised surface; rows divide with hairlines.", test: (n) => n.startsWith("table-") || n === "color-table-hover" },
	{ title: "Errors and warnings", id: "errors", intro: "`destructive` is a fill; red text uses `error-text`, which reads in every theme.", test: (n) => n.startsWith("destructive") || n === "error-text" || n === "color-error-light" || n.startsWith("color-yellow-") },
	{ title: "Status", id: "status", intro: "The squares inside StatusChip. The label stays neutral; hue lives only in the square.", test: (n) => n.startsWith("status-") },
	{ title: "Charts", id: "charts", intro: "Categorical series in a fixed, colour-blind-validated order, and a sequential ramp.", test: (n) => n.startsWith("chart-") },
	{ title: "Panel button", id: "panel", intro: "The tactile tiles used for big choices in onboarding.", test: (n) => n.startsWith("panel-") || n === "color-panel-icon-background" },
	{ title: "Compatibility and palette", id: "palette", intro: "shadcn slots kept for compatibility, and the Tailwind palette steps components use directly.", test: () => true },
];

const COLOR = /^(#|rgb|hsl|oklch|oklab|lab\(|lch\(|color-mix|transparent|var\(--)/i;

function parseBlocks(css: string) {
	const blocks: { selector: string; vars: Map<string, string> }[] = [];
	for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const vars = new Map<string, string>();
		for (const v of m[2].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) vars.set(v[1], v[2].trim());
		blocks.push({ selector: m[1].replace(/\/\*[\s\S]*?\*\//g, "").trim(), vars });
	}
	return blocks;
}

export function colorTokens() {
	const css = readUi("dist/styles/tokens.css") ?? readUi("src/styles/tokens.css") ?? "";
	const blocks = parseBlocks(css);
	const find = (attr: string) => blocks.find((b) => b.selector.includes(`[data-theme="${attr}"]`) && b.vars.size > 0)?.vars ?? new Map<string, string>();
	const light = find("light");
	const byTheme: Record<ThemeId, Map<string, string>> = { light, dark: find("dark"), modern: find("modern"), "modern-dark": find("modern-dark") };
	const tokens: ColorToken[] = [];
	for (const [name, value] of light) {
		if (!COLOR.test(value)) continue;
		const values = Object.fromEntries(THEMES.map((t) => [t.id, byTheme[t.id].get(name) ?? value])) as Record<ThemeId, string>;
		tokens.push({ name, usage: (notes as Record<string, string>)[name] ?? "", values });
	}
	const used = new Set<string>();
	return GROUPS.map((g) => {
		const items = tokens.filter((t) => !used.has(t.name) && g.test(t.name));
		for (const t of items) used.add(t.name);
		return { ...g, items };
	}).filter((g) => g.items.length);
}

export function colorsMarkdown() {
	const groups = colorTokens();
	const lines = [
		"# Colors",
		"",
		"Every colour token in Cynco UI, per theme. Tokens are CSS variables (`var(--card)`) and Tailwind colours (`bg-card`, `text-tertiary-foreground`). Light is the default; switch with `class=\"dark\"` or `data-theme` (`dark`, `modern`, `modern-dark`).",
		"",
	];
	for (const g of groups) {
		lines.push(`## ${g.title}`, "", g.intro, "", "| Token | Light | Dark | Modern | Modern dark | Use |", "| --- | --- | --- | --- | --- | --- |");
		for (const t of g.items) lines.push(`| \`${t.name}\` | ${THEMES.map((th) => `\`${t.values[th.id]}\``).join(" | ")} | ${t.usage.replace(/\|/g, "\\|")} |`);
		lines.push("");
	}
	return lines.join("\n");
}
