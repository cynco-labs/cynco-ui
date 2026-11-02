import type { RegistryEntry } from "./registry";

/**
 * The text behind every "Copy prompt" button: a brief a visitor pastes into a coding agent. Self-contained,
 * so the agent can do the job without fetching anything, with the docs URL for anything more.
 */
export const SITE = "https://ui.cynco.io";

const INSTALL = [
	"Install: `pnpm add @cynco-labs/ui @phosphor-icons/react` (React 19). The package is in the restricted @cynco-labs npm org, so `npm login` with an org account or set `//registry.npmjs.org/:_authToken=${NPM_TOKEN}` in .npmrc.",
	'Styles, in the main stylesheet: `@import "tailwindcss"; @import "@cynco-labs/ui/fonts.css"; @import "@cynco-labs/ui/theme.css";`. Without Tailwind, `import "@cynco-labs/ui/styles.css"` once at the root instead.',
	"Wrap the app once in `<TooltipProvider>` from @cynco-labs/ui. Dark mode is the `dark` class on <html>; the Modern theme adds `preset-modern`.",
];

const RULES = [
	"Colours, radii and shadows come from theme tokens (`bg-card`, `text-muted-foreground`, `border-border`, `text-error-text`), never hex values or Tailwind palette colours.",
	"Amounts are decimal strings (`\"1234.50\"`), never floats. Use `parseAmount`, `sumAmounts`, `formatCurrency` from @cynco-labs/ui. Documents print totals exactly as given.",
	"Lists of records use `DataList`, KPI rows `StatGrid`/`StatTile`, toolbars `ActionBar`. Don't hand-build tables or flex rows for these.",
	"Components size to their container (container queries), so place them in any column width from 320px up; don't wrap them in fixed widths.",
	"Printed documents stay black ink: no colour, tints or filled bars.",
];

export function installPrompt(): string {
	return [
		"Set up Cynco UI (@cynco-labs/ui), the design system for accounting and ERP interfaces, in my React app.",
		"",
		...INSTALL.map((l) => `- ${l}`),
		"",
		"Follow these rules when building screens with it:",
		...RULES.map((l) => `- ${l}`),
		"",
		`Component index (every page is Markdown): ${SITE}/llms.txt`,
		`Agent skill with the full rules: ${SITE}/skill.md`,
	].join("\n");
}

const propsMarkdown = (entry: RegistryEntry): string[] => {
	if (!entry.props?.props.length) return entry.provide ? ["## Props", "", entry.provide, ""] : [];
	const rows = entry.props.props.map((p) => {
		const desc = [p.description, p.default ? `Default \`${p.default}\`.` : ""].filter(Boolean).join(" ");
		return `- \`${p.name}${p.required ? "" : "?"}\`: \`${p.type}\`${desc ? `. ${desc}` : ""}`;
	});
	const inherits = entry.props.inherits.length ? [`Also accepts ${entry.props.inherits.map((i) => `\`${i}\``).join(", ")}.`] : [];
	return ["## Props", "", ...rows, ...inherits, ""];
};

/** The demo without its playground `controls`, which only the docs site reads. */
const exampleSource = (demo: string) => demo.replace(/^export const controls = \{[\s\S]*?^\};\n+/m, "");

export function componentPrompt(entry: RegistryEntry, demoSource: string): string {
	return [
		`Add the ${entry.name} component from Cynco UI (${entry.importFrom}) to my React app.`,
		"",
		entry.summary,
		"",
		"## Setup (skip what the project already has)",
		"",
		...INSTALL.map((l) => `- ${l}`),
		"",
		"## Import",
		"",
		"```tsx",
		`import { ${entry.name} } from "${entry.importFrom}";`,
		"```",
		"",
		...(entry.use ? ["## When to use it", "", entry.use, ""] : []),
		...propsMarkdown(entry),
		...(entry.notes ? ["## Design notes", "", entry.notes, ""] : []),
		"## Example",
		"",
		"```tsx",
		exampleSource(demoSource).trimEnd(),
		"```",
		"",
		"## Rules",
		"",
		...RULES.map((l) => `- ${l}`),
		"",
		`Docs: ${SITE}/components/${entry.slug} (Markdown: ${SITE}/components/${entry.slug}.md)`,
	].join("\n");
}
