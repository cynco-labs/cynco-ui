#!/usr/bin/env node
/**
 * Migrates call sites off the components removed when general/ and table/ were deduplicated.
 *
 *   node scripts/codemods/dedupe-components.mjs --dry-run    # report, change nothing
 *   node scripts/codemods/dedupe-components.mjs              # rewrite in place
 *
 * It rewrites what a rename can express: the imported name, the JSX tag, renamed props, and the
 * props that pick the survivor's variant. Everything else it reports as MANUAL with a file and
 * line, because the shape changed and a regex would guess. Running it twice changes nothing:
 * every rename maps a removed name onto a surviving one, and a prop is only added when the tag
 * does not already set it.
 *
 * Dependency-free on purpose, like the other scripts here, so it runs before anything is installed.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DRY_RUN = process.argv.includes("--dry-run");

const TARGETS = ["packages/ui/src", "apps/docs/src/demos"];
const META = "packages/ui/registry/meta.json";

/** Removed name -> surviving name. The props below are applied to the renamed tag. */
const RENAMES = {
	FormLabel: "Label",
	IconCheckbox: "ToggleButton",
	IconTooltipButton: "IconButton",
	CopyIconButton: "CopyButton",
	MiniCopyButton: "CopyButton",
	CopyTextButton: "CopyButton",
	CopyableSpan: "CopyButton",
};

/** Props to set on a renamed tag, unless the call site already sets them. */
const ADD_PROPS = {
	IconCheckbox: [],
	IconTooltipButton: ['variant="secondary"', 'size="icon"', 'iconOrientation="center"'],
	CopyIconButton: ['variant="icon"'],
	MiniCopyButton: ['variant="inline"'],
	CopyTextButton: ['variant="text"'],
	CopyableSpan: ['variant="inline"'],
};

/** Props renamed on a surviving component: old name -> new name, per removed (or kept) tag. */
const PROP_RENAMES = {
	IconCheckbox: { checked: "pressed", defaultChecked: "defaultPressed", onCheckedChange: "onPressedChange" },
	MiniCopyButton: { displayText: "children" },
	ConditionalTooltip: { contentClassName: "className" },
	FieldLabel: { tooltip: "hint" },
};

/** Names whose replacement is a different shape; a rename would be a lie, so report them. */
const MANUAL = {
	LabelInput: "compose Field › FieldLabel + FieldDescription + FieldControl(<Input/>)",
	TextCheckbox: "compose <Label><Checkbox/> text</Label>",
	SheetCloseButton: 'use <IconButton aria-label="Close" icon={<XIcon/>} onClick={…}/>',
	CursorPagination: "use <DataTable.Pagination cursor={{…}}/>",
	PageSizeSelector: "use DataTable.Pagination's pageSizeOptions",
	TablePaginationFooter: "use <DataTable.Pagination/>",
	useIsMobile: "use useContainerWidth(), which measures the component's own box",
};

function walk(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) {
			if (entry !== "node_modules" && entry !== "dist") walk(path, out);
		} else if (/\.tsx?$/.test(path)) {
			out.push(path);
		}
	}
	return out;
}

/** Every JSX opening tag for `name`, as [start, end) spans over the whole tag. */
function openingTags(src, name) {
	const spans = [];
	const open = new RegExp(`<${name}(?=[\\s/>])`, "g");
	for (let m = open.exec(src); m; m = open.exec(src)) {
		let depth = 0;
		let i = m.index;
		for (; i < src.length; i++) {
			const c = src[i];
			if (c === "{") depth++;
			else if (c === "}") depth--;
			else if (c === '"' || c === "'") {
				const close = src.indexOf(c, i + 1);
				if (close === -1) break;
				i = close;
			} else if (c === ">" && depth === 0) {
				break;
			}
		}
		spans.push([m.index, i + 1]);
	}
	return spans;
}

function renameTagsAndProps(src, from, to) {
	const addProps = ADD_PROPS[from] ?? [];
	const propRenames = PROP_RENAMES[from] ?? {};
	let out = src;

	for (const [start, end] of openingTags(src, from).reverse()) {
		let tag = src.slice(start, end);
		for (const [oldProp, newProp] of Object.entries(propRenames)) {
			tag = tag.replace(new RegExp(`(\\s)${oldProp}(?==|\\s|/|>)`, "g"), `$1${newProp}`);
		}
		const missing = addProps.filter((prop) => !tag.includes(`${prop.split("=")[0]}=`));
		const selfClosing = tag.endsWith("/>");
		const body = tag.slice(1 + from.length, selfClosing ? -2 : -1).trimEnd();
		tag = `<${to}${[...missing, body.trim()]
			.filter(Boolean)
			.map((p) => ` ${p}`)
			.join("")}${selfClosing ? " />" : ">"}`;
		out = out.slice(0, start) + tag + out.slice(end);
	}

	// Closing tags, and the identifier wherever it is imported or referenced.
	out = out.replaceAll(`</${from}>`, `</${to}>`);
	out = out.replace(new RegExp(`\\b${from}\\b`, "g"), to);
	return out;
}

function dedupeImportNames(src) {
	return src.replace(/import \{([^}]*)\} from (["'][^"']+["']);/g, (whole, names, source) => {
		const parts = names
			.split(",")
			.map((p) => p.trim())
			.filter(Boolean);
		const seen = new Set();
		const kept = parts.filter((p) => !seen.has(p) && seen.add(p));
		return kept.length === parts.length ? whole : `import { ${kept.join(", ")} } from ${source};`;
	});
}

const changed = [];
const manual = [];

for (const target of TARGETS) {
	for (const file of walk(join(ROOT, target))) {
		const before = readFileSync(file, "utf8");
		let after = before;

		for (const [from, to] of Object.entries(RENAMES)) {
			if (new RegExp(`\\b${from}\\b`).test(after)) after = renameTagsAndProps(after, from, to);
		}
		for (const [tag, renames] of Object.entries(PROP_RENAMES)) {
			if (RENAMES[tag]) continue; // already handled with its rename
			for (const [start, end] of openingTags(after, tag).reverse()) {
				let piece = after.slice(start, end);
				for (const [oldProp, newProp] of Object.entries(renames)) {
					piece = piece.replace(new RegExp(`(\\s)${oldProp}(?==|\\s|/|>)`, "g"), `$1${newProp}`);
				}
				after = after.slice(0, start) + piece + after.slice(end);
			}
		}
		after = dedupeImportNames(after);

		for (const [name, advice] of Object.entries(MANUAL)) {
			for (const [index, line] of after.split("\n").entries()) {
				if (new RegExp(`\\b${name}\\b`).test(line)) {
					manual.push(`${relative(ROOT, file)}:${index + 1}  ${name} — ${advice}`);
				}
			}
		}

		if (after !== before) {
			changed.push(relative(ROOT, file));
			if (!DRY_RUN) writeFileSync(file, after);
		}
	}
}

// The registry lists components by name, so a rename has to land there too.
const metaPath = join(ROOT, META);
const metaBefore = readFileSync(metaPath, "utf8");
let metaAfter = metaBefore;
for (const [from, to] of Object.entries(RENAMES)) {
	metaAfter = metaAfter.replace(new RegExp(`"name": "${from}"`, "g"), `"name": "${to}"`);
}
if (metaAfter !== metaBefore) {
	changed.push(META);
	if (!DRY_RUN) writeFileSync(metaPath, metaAfter);
}

console.log(`${DRY_RUN ? "Would rewrite" : "Rewrote"} ${changed.length} file${changed.length === 1 ? "" : "s"}.`);
for (const file of changed) console.log(`  ${file}`);
if (manual.length) {
	console.log(`\n${manual.length} call site${manual.length === 1 ? "" : "s"} need a hand:`);
	for (const line of [...new Set(manual)]) console.log(`  ${line}`);
}
