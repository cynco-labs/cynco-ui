#!/usr/bin/env node
/**
 * Builds the component registry from packages/ui/registry/meta.json and the demos in apps/docs/src/demos.
 *
 *   pnpm registry            (node scripts/build-registry.mjs)
 *
 * Writes:
 *   packages/ui/registry/components.json  [{ name, slug, category, group, summary, use, provide, notes,
 *                                           sourcePath, demoPath, importFrom, height }]
 *   packages/ui/registry/docs/<slug>.md   one markdown page per component (used by the CLI and the docs
 *                                           site's .md endpoints)
 *
 * meta.json is the hand-edited source of truth for names, categories and copy. The demo file is the usage
 * example; sourcePath is found by scanning packages/ui/src for the component's export.
 * Dependency-free on purpose so it runs before anything is installed.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UI = join(ROOT, "packages/ui");
const REGISTRY = join(UI, "registry");
const DEMOS = join(ROOT, "apps/docs/src/demos");
const CATEGORIES = ["Layout", "Components", "Productivity", "Documents", "Accounting", "AI"];

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
	if (c.provide) lines.push("## Props", "", c.provide, "");
	if (c.notes) lines.push("## Notes", "", c.notes, "");
	lines.push(`Category: ${c.category}${c.group && c.group !== c.category ? ` · ${c.group}` : ""}. Source: \`${c.sourcePath}\`.`, "");
	return lines.join("\n");
}

const meta = JSON.parse(readFileSync(join(REGISTRY, "meta.json"), "utf8"));
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
