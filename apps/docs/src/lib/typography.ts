export const FACES = [
	{
		name: "Inter",
		role: "The UI face. Variable with optical sizes; weight 500 by default, letter-spacing −0.033px.",
		css: "font-sans",
		sample: "Invoice INV-2026-0142 · RM 12,720.00",
		family: '"Inter", sans-serif',
	},
	{
		name: "JetBrains Mono",
		role: "IDs, account codes, document numbers, keys and code.",
		css: "font-mono",
		sample: "1200-001  INV-2026-0142  C25718364020",
		family: '"JetBrains Mono", monospace',
	},
	{
		name: "Geist",
		role: "An alternative typeface for printed documents, chosen in the document brand.",
		css: "font-[Geist]",
		sample: "Statement of account · 31 Oct 2026",
		family: '"Geist", sans-serif',
	},
	{
		name: "Newsreader",
		role: "The serif of the Classic document layout, also selectable for any document.",
		css: "font-[Newsreader]",
		sample: "Tax invoice · Arus Teknik Sdn Bhd",
		family: '"Newsreader", serif',
	},
];

/** The whole scale. Nothing in the library sets a size any other way. */
export const SIZES = [
	{ cls: "text-2xs", px: 11, use: "Meta, captions, keycaps and IDs." },
	{ cls: "text-xs", px: 12, use: "Secondary labels, table headers, counts." },
	{ cls: "text-sm", px: 13, use: "The base size: body copy, labels, inputs, table cells." },
	{ cls: "text-md", px: 15, use: "Section headings and a lead paragraph." },
	{ cls: "text-lg", px: 17, use: "Page and sheet titles." },
	{ cls: "text-xl", px: 20, use: "The largest heading on a screen." },
	{ cls: "text-display", px: 28, use: "One hero figure, such as a dashboard's headline amount. Nothing else." },
];

export const WEIGHTS = [
	{ cls: "font-normal", value: 450, use: "Quiet copy. Note: 450, not 400." },
	{ cls: "font-medium", value: 500, use: "The default UI weight." },
	{ cls: "font-semibold", value: 600, use: "Headings, labels, totals." },
];

/** Text colours, darkest to quietest. A size never carries a colour, so always pair the two. */
export const COLOURS = [
	{ cls: "text-foreground", use: "Titles, totals, the value the reader came for." },
	{ cls: "text-muted-foreground", use: "Body copy and form labels." },
	{ cls: "text-tertiary-foreground", use: "Secondary copy and help text." },
	{ cls: "text-subtle", use: "Meta, timestamps, counts." },
	{ cls: "text-placeholder", use: "Empty fields only." },
];

/**
 * The pre-token classes and the utilities they became. `scripts/codemods/legacy-type-classes.mjs`
 * performs the rewrite; typography.test.ts holds this table to what that codemod actually does.
 */
export const LEGACY = [
	{ cls: "text-giga", now: ["text-display", "font-semibold", "text-foreground"] },
	{ cls: "text-main", now: ["text-lg", "font-semibold", "text-foreground"] },
	{ cls: "text-main-sec", now: ["text-lg", "font-medium", "text-foreground"] },
	{ cls: "text-sub", now: ["text-md", "font-semibold", "text-muted-foreground"] },
	{ cls: "text-sub-secondary", now: ["text-md", "font-medium", "text-muted-foreground"] },
	{ cls: "text-body", now: ["text-sm", "font-medium", "text-muted-foreground"] },
	{ cls: "text-body-highlight", now: ["text-sm", "font-semibold", "text-muted-foreground"] },
	{ cls: "text-body-secondary", now: ["text-sm", "text-subtle"] },
	{ cls: "text-body-sec-paragraph", now: ["text-sm", "font-medium", "text-tertiary-foreground"] },
	{ cls: "text-tiny", now: ["text-2xs"] },
	{ cls: "text-tiny-id", now: ["text-2xs", "font-medium", "font-mono"] },
	{ cls: "text-checkbox-label", now: ["text-sm", "font-semibold", "text-muted-foreground"] },
	{ cls: "text-checkbox-descr", now: ["text-sm", "font-semibold", "text-tertiary-foreground"] },
	{ cls: "text-checkbox-disabled", now: ["text-sm", "font-semibold", "text-placeholder"] },
	{ cls: "text-form-text", now: ["text-sm", "font-medium", "text-muted-foreground"] },
	{ cls: "text-form-label", now: ["text-sm", "font-medium", "text-muted-foreground"] },
	{ cls: "text-form-placeholder", now: ["text-sm", "font-medium", "text-placeholder"] },
];

export const RULES = [
	"Sizes are small and tight: 13px is the base. Hierarchy comes from weight and the five text colours, not from big size jumps.",
	"Use the named sizes (`text-2xs` … `text-xl`, and `text-display` for a single hero figure). Never an arbitrary value such as `text-[13px]`.",
	"A size sets size alone, so pair it with a weight and a colour: `text-sm font-medium text-muted-foreground`.",
	"Inputs grow on touch screens: `text-sm touch:text-base`, because iOS Safari zooms the page into any field under 16px.",
	"Button sizes are `sm` (24px), `md` (28px, the default, matching an Input) and `icon` (24px square).",
	"Titles and buttons are sentence case. Buttons start with a verb: “Create invoice”, “Record payment”, “Save changes”.",
	"Money is always `tabular-nums` and right-aligned, formatted with the currency's own locale: “RM 1,234.56”. Negatives in statements are bracketed and red; an exact zero is a muted em dash.",
	"Account codes, document numbers and IDs are mono (`1000-001`, `INV-2026-0142`). Dates read “29 Oct 2026”.",
	"No emoji in product UI. Address the user as “you”.",
];

export function typographyMarkdown() {
	const l = [
		"# Typography",
		"",
		"Inter for the interface, JetBrains Mono for codes and IDs, and a small, tight type scale where hierarchy comes from weight and colour.",
		"",
		"## Typefaces",
		"",
		...FACES.map((f) => `- **${f.name}** (\`${f.css}\`): ${f.role}`),
		"",
		"All four are bundled in `@cynco-labs/ui/fonts.css` (latin subsets, SIL Open Font License).",
		"",
		"## Sizes",
		"",
		"| Class | Size | Use |",
		"| --- | --- | --- |",
		...SIZES.map((s) => `| \`${s.cls}\` | ${s.px}px | ${s.use} |`),
		"",
		"## Weights",
		"",
		"| Class | Weight | Use |",
		"| --- | --- | --- |",
		...WEIGHTS.map((w) => `| \`${w.cls}\` | ${w.value} | ${w.use} |`),
		"",
		"## Colours",
		"",
		"| Class | Use |",
		"| --- | --- |",
		...COLOURS.map((c) => `| \`${c.cls}\` | ${c.use} |`),
		"",
		"## Rules",
		"",
		...RULES.map((r) => `- ${r}`),
		"",
		"## Migrating off the old type classes",
		"",
		"The pre-token classes bundled a size, a weight and usually a colour into one name. They no longer exist.",
		"Run `node scripts/codemods/legacy-type-classes.mjs` to rewrite them, or apply this table by hand.",
		"",
		"| Was | Now |",
		"| --- | --- |",
		...LEGACY.map((t) => `| \`${t.cls}\` | ${t.now.map((n) => `\`${n}\``).join(" ")} |`),
		"",
	];
	return l.join("\n");
}
