#!/usr/bin/env node
/**
 * Builds the component registry from packages/ui/registry/meta.json and the demos in apps/docs/src/demos.
 *
 *   pnpm registry            (node scripts/build-registry.mjs)
 *
 * Writes:
 *   packages/ui/registry/components.json  [{ name, slug, category, group, summary, use, provide, notes,
 *                                           sourcePath, demoPath, importFrom, height, props }]
 *   packages/ui/registry/docs/<slug>.md   one markdown page per component (used by the CLI and the docs
 *                                           site's .md endpoints)
 *
 * meta.json is the hand-edited source of truth for names, categories and copy. The demo file is the usage
 * example; sourcePath is found by scanning packages/ui/src for the component's export. props come from
 * registry/props.json, generated from the TypeScript source by scripts/extract-props.mjs.
 * Dependency-free on purpose so it runs before anything is installed.
 *
 * Also fails the build when the docs would mislead: a demo importing something a reader can't install, a
 * playground control the demo ignores, or a link to a page that doesn't exist.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UI = join(ROOT, "packages/ui");
const REGISTRY = join(UI, "registry");
const DEMOS = join(ROOT, "apps/docs/src/demos");
const CATEGORIES = ["Layout", "Components", "Productivity", "Documents", "Accounting", "AI"];
const GUIDES = join(ROOT, "apps/docs/src/content/guides");
/** What a demo may import: what a reader of the docs installs. Anything else would not run if copied. */
const DEMO_IMPORTS = /^(react|@cynco-labs\/ui|@cynco-labs\/ui\/ai|@phosphor-icons\/react|recharts|@tanstack\/react-table)$/;

export const slugify = (name) =>
	name
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
		.toLowerCase();

function walk(dir, out = []) {
	for (const f of readdirSync(dir)) {
		const p = join(dir, f);
		if (statSync(p).isDirectory()) walk(p, out);
		else if (/\.(tsx?|ts)$/.test(f) && !/\.(test|spec|d)\.tsx?$/.test(f)) out.push(p);
	}
	return out;
}

function resolveModule(base) {
	for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) if (existsSync(base + ext)) return base + ext;
	return null;
}

/** name -> first source file that declares it as an export */
function exportIndex() {
	const index = new Map();
	const add = (name, file) => {
		if (!index.has(name)) index.set(name, relative(ROOT, file));
	};
	for (const file of walk(join(UI, "src"))) {
		const src = readFileSync(file, "utf8");
		for (const m of src.matchAll(/export\s+(?:declare\s+)?(?:default\s+)?(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/g)) add(m[1], file);
		for (const m of src.matchAll(/export\s*\{([^}]*)\}(?!\s*from)/g))
			for (const part of m[1].split(",")) {
				const seg = part.trim().split(/\s+as\s+/);
				const name = (seg[1] ?? seg[0]).trim();
				if (name && name !== "type") add(name, file);
			}
		// renamed re-exports: `export { Table as DataTable } from "./base/components/table"`
		for (const m of src.matchAll(/export\s*\{([^}]*)\}\s*from\s*["'](\.[^"']+)["']/g)) {
			const target = resolveModule(join(dirname(file), m[2]));
			if (!target) continue;
			for (const part of m[1].split(",")) {
				const seg = part.trim().split(/\s+as\s+/);
				if (seg[1]) add(seg[1].trim(), target);
			}
		}
	}
	return index;
}

function markdown(c, demo) {
	const lines = [`# ${c.name}`, "", c.summary, "", "```tsx", `import { ${c.name} } from "${c.importFrom}";`, "```", ""];
	lines.push("## Usage", "", "```tsx", demo.trimEnd(), "```", "");
	if (c.use) lines.push("## Use", "", c.use, "");
	if (c.provide || c.props?.props.length) {
		lines.push("## Props", "");
		if (c.provide) lines.push(c.provide, "");
		if (c.props?.props.length) {
			for (const p of c.props.props) {
				const desc = [p.description, p.default ? `Default \`${p.default}\`.` : ""].filter(Boolean).join(" ");
				lines.push(`- \`${p.name}${p.required ? "" : "?"}\`: \`${p.type}\`${desc ? `. ${desc}` : ""}`);
			}
			if (c.props.inherits.length) lines.push(`- Also accepts ${c.props.inherits.map((i) => `\`${i}\``).join(", ")}.`);
			lines.push("");
		}
	}
	if (c.notes) lines.push("## Notes", "", c.notes, "");
	lines.push(`Category: ${c.category}${c.group && c.group !== c.category ? ` · ${c.group}` : ""}. Source: \`${c.sourcePath}\`.`, "");
	return lines.join("\n");
}

/** Problems in one demo file: imports a reader can't install, controls the default export doesn't take. */
function checkDemo(file) {
	const src = readFileSync(file, "utf8");
	const problems = [];
	for (const m of src.matchAll(/^import[^"']*["']([^"']+)["']/gm)) if (!DEMO_IMPORTS.test(m[1])) problems.push(`imports "${m[1]}"`);
	const controls = src.match(/^export const controls = \{([\s\S]*?)^\};/m);
	if (controls) {
		// The destructured names, with or without a type annotation after the pattern.
		const params = src.match(/^export default function \w*\(\{([^}]*)\}/m)?.[1] ?? "";
		for (const k of controls[1].matchAll(/^\s+["']?(\w+)["']?\s*:\s*\{/gm)) if (!new RegExp(`\\b${k[1]}\\b`).test(params)) problems.push(`control "${k[1]}" is not a parameter of the default export`);
	}
	return problems;
}

const meta = JSON.parse(readFileSync(join(REGISTRY, "meta.json"), "utf8"));
const propsFile = join(REGISTRY, "props.json");
const props = existsSync(propsFile) ? JSON.parse(readFileSync(propsFile, "utf8")) : {};
const index = exportIndex();
const errors = [];
const seen = new Set();
const components = [];
for (const m of meta) {
	if (seen.has(m.name)) errors.push(`${m.name}: listed twice`);
	seen.add(m.name);
	if (!CATEGORIES.includes(m.category)) errors.push(`${m.name}: unknown category "${m.category}"`);
	const demoFile = join(DEMOS, `${m.name}.tsx`);
	if (!existsSync(demoFile)) errors.push(`${m.name}: missing demo ${relative(ROOT, demoFile)}`);
	else for (const p of checkDemo(demoFile)) errors.push(`${relative(ROOT, demoFile)}: ${p}`);
	if (!m.summary) errors.push(`${m.name}: no summary in registry/meta.json`);
	if (!(m.name in props)) errors.push(`${m.name}: not in registry/props.json (run node scripts/extract-props.mjs)`);
	const sourcePath = index.get(m.name);
	if (!sourcePath) errors.push(`${m.name}: no export found in packages/ui/src`);
	components.push({
		name: m.name,
		slug: slugify(m.name),
		category: m.category,
		group: m.group ?? m.category,
		summary: m.summary ?? "",
		use: m.use ?? "",
		provide: m.provide ?? "",
		notes: m.notes ?? "",
		sourcePath: sourcePath ?? "",
		demoPath: relative(ROOT, demoFile),
		importFrom: m.category === "AI" ? "@cynco-labs/ui/ai" : "@cynco-labs/ui",
		height: m.height ?? 160,
		props: props[m.name] ?? null,
	});
}
const slugs = new Set();
for (const c of components) {
	if (slugs.has(c.slug)) errors.push(`${c.name}: duplicate slug ${c.slug}`);
	slugs.add(c.slug);
}
if (existsSync(DEMOS)) {
	for (const f of readdirSync(DEMOS)) {
		const name = f.replace(/\.tsx$/, "");
		if (f.endsWith(".tsx") && !seen.has(name)) errors.push(`${f}: demo has no entry in registry/meta.json`);
	}
}
// Links to /components/<slug> and /<guide> in the copy and the guides must resolve.
const guides = existsSync(GUIDES) ? readdirSync(GUIDES).filter((f) => f.endsWith(".md")) : [];
const pages = new Set(["/", "/components", "/colors", "/typography", "/llms.txt", "/skill", "/index", ...guides.map((f) => `/${f.replace(/\.md$/, "")}`), ...[...slugs].map((s) => `/components/${s}`)]);
const texts = [
	...components.map((c) => [`registry/meta.json (${c.name})`, `${c.summary}\n${c.use}\n${c.provide}\n${c.notes}`]),
	...guides.map((f) => [`guides/${f}`, readFileSync(join(GUIDES, f), "utf8")]),
];
for (const [where, text] of texts)
	for (const m of text.matchAll(/\]\((\/[^)#\s]*)/g)) {
		const path = m[1].replace(/\.md$/, "").replace(/\/$/, "") || "/";
		if (!pages.has(path)) errors.push(`${where}: link to ${m[1]} has no page`);
	}

if (errors.length) {
	console.error(`registry: ${errors.length} problem(s)\n  ${errors.join("\n  ")}`);
	process.exit(1);
}
components.sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category));

writeFileSync(join(REGISTRY, "components.json"), `${JSON.stringify(components, null, "\t")}\n`);
const docsDir = join(REGISTRY, "docs");
rmSync(docsDir, { recursive: true, force: true });
mkdirSync(docsDir, { recursive: true });
for (const c of components) writeFileSync(join(docsDir, `${c.slug}.md`), markdown(c, readFileSync(join(ROOT, c.demoPath), "utf8")));

const counts = CATEGORIES.map((cat) => `${cat} ${components.filter((c) => c.category === cat).length}`).join(", ");
console.log(`registry: ${components.length} components (${counts})`);
