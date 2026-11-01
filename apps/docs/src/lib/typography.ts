export const FACES = [
	{ name: "Inter", role: "The UI face. Variable with optical sizes; weight 500 by default, letter-spacing −0.033px.", css: "font-sans", sample: "Invoice INV-2026-0142 · RM 12,720.00", family: '"Inter", sans-serif' },
	{ name: "JetBrains Mono", role: "IDs, account codes, document numbers, keys and code.", css: "font-mono", sample: "1200-001  INV-2026-0142  C25718364020", family: '"JetBrains Mono", monospace' },
	{ name: "Geist", role: "An alternative typeface for printed documents, chosen in the document brand.", css: "font-[Geist]", sample: "Statement of account · 31 Oct 2026", family: '"Geist", sans-serif' },
	{ name: "Newsreader", role: "The serif of the Classic document layout, also selectable for any document.", css: "font-[Newsreader]", sample: "Tax invoice · Arus Teknik Sdn Bhd", family: '"Newsreader", serif' },
];

export const TYPE_CLASSES = [
	{ cls: "text-giga", size: "23px", weight: "600", color: "foreground", use: "The rare giant heading.", sample: "RM 84,215.40" },
	{ cls: "text-main", size: "17px", weight: "600", color: "foreground", use: "Page and sheet titles.", sample: "Invoices" },
	{ cls: "text-main-sec", size: "17px", weight: "500", color: "foreground", use: "A quieter title.", sample: "October 2026" },
	{ cls: "text-sub", size: "15px", weight: "600", color: "muted-foreground", use: "Section labels and sub-headings.", sample: "Line items" },
	{ cls: "text-body", size: "13px", weight: "500", color: "muted-foreground", use: "Copy. The base size of the system.", sample: "Payment received from Nusantara Logistik Bhd." },
	{ cls: "text-body-highlight", size: "13px", weight: "600", color: "muted-foreground", use: "Emphasis inside body copy.", sample: "Balance due on 27 Nov 2026" },
	{ cls: "text-body-secondary", size: "13px", weight: "450", color: "subtle", use: "Secondary copy and metadata.", sample: "Last synced 4 minutes ago" },
	{ cls: "text-form-label", size: "13px", weight: "500", color: "muted-foreground", use: "Form labels.", sample: "Customer name" },
	{ cls: "text-tiny", size: "11px", weight: "450", color: "inherits", use: "Meta and captions.", sample: "Updated 29 Oct 2026" },
	{ cls: "text-tiny-id", size: "11px", weight: "500", color: "inherits", use: "IDs and codes, in the mono face.", sample: "INV-2026-0142" },
];

export const SIZES = [
	{ cls: "text-2xs", px: 11 },
	{ cls: "text-xs", px: 12 },
	{ cls: "text-sm", px: 13 },
	{ cls: "text-md", px: 15 },
	{ cls: "text-lg", px: 17 },
	{ cls: "text-xl", px: 20 },
];

export const WEIGHTS = [
	{ cls: "font-normal", value: 450, use: "Quiet copy. Note: 450, not 400." },
	{ cls: "font-medium", value: 500, use: "The default UI weight." },
	{ cls: "font-semibold", value: 600, use: "Headings, labels, totals." },
];

export const RULES = [
	"Sizes are small and tight: 13px is the base. Hierarchy comes from weight and the four text colours, not from big size jumps.",
	"Titles and buttons are sentence case. Buttons start with a verb: “Create invoice”, “Record payment”, “Save changes”.",
	"Type classes (`text-body`, `text-sub` …) set their own colour, so pair a colour utility with a Tailwind size (`text-sm text-tertiary-foreground`), not with a type class.",
	"Use the named sizes (`text-2xs` … `text-xl`) instead of arbitrary values such as `text-[13px]`.",
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
		"## Type classes",
		"",
		"| Class | Size | Weight | Colour | Use |",
		"| --- | --- | --- | --- | --- |",
		...TYPE_CLASSES.map((t) => `| \`${t.cls}\` | ${t.size} | ${t.weight} | \`${t.color}\` | ${t.use} |`),
		"",
		"## Sizes",
		"",
		"| Class | Size |",
		"| --- | --- |",
		...SIZES.map((s) => `| \`${s.cls}\` | ${s.px}px |`),
		"",
		"## Weights",
		"",
		"| Class | Weight | Use |",
		"| --- | --- | --- |",
		...WEIGHTS.map((w) => `| \`${w.cls}\` | ${w.value} | ${w.use} |`),
		"",
		"## Rules",
		"",
		...RULES.map((r) => `- ${r}`),
		"",
	];
	return l.join("\n");
}
