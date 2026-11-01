#!/usr/bin/env node
// cynco-ui — browse Cynco UI components and read their docs from the terminal.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(readFileSync(join(root, "registry", "components.json"), "utf8"));
const [cmd, ...args] = process.argv.slice(2);
const pad = (s, n) => (s.length >= n ? s : s + " ".repeat(n - s.length));
const find = (q) => {
	const k = q.toLowerCase().replace(/[^a-z0-9]/g, "");
	return registry.find((c) => c.slug.replace(/-/g, "") === k || c.name.toLowerCase() === k);
};

function help() {
	console.log(`cynco-ui — Cynco UI component registry

Usage
  cynco-ui list [category]     List components (categories: ${[...new Set(registry.map((c) => c.category))].join(", ").toLowerCase()})
  cynco-ui docs <name|slug>    Print a component's docs (summary, import, usage, props, notes)
  cynco-ui search <text>       Find components by name or description
  cynco-ui --help              Show this help`);
}

function list(category) {
	const rows = category ? registry.filter((c) => c.category.toLowerCase() === category.toLowerCase()) : registry;
	if (!rows.length) return console.error(`No components in "${category}".`), process.exit(1);
	let current = "";
	for (const c of rows) {
		if (c.category !== current) console.log(`\n${(current = c.category)}`);
		console.log(`  ${pad(c.name, 30)} ${c.summary.slice(0, 90)}${c.summary.length > 90 ? "…" : ""}`);
	}
}

function docs(q) {
	const c = q && find(q);
	if (!c) return console.error(`Unknown component "${q ?? ""}". Try: cynco-ui search ${q ?? "<text>"}`), process.exit(1);
	const md = join(root, "registry", "docs", `${c.slug}.md`);
	console.log(existsSync(md) ? readFileSync(md, "utf8") : `# ${c.name}\n\n${c.summary}\n\nimport { ${c.name} } from "${c.importFrom}";`);
}

function search(text) {
	const t = (text ?? "").toLowerCase();
	const hits = registry.filter((c) => `${c.name} ${c.summary} ${c.use}`.toLowerCase().includes(t));
	if (!hits.length) return console.log("No matches.");
	for (const c of hits) console.log(`${pad(c.name, 30)} ${pad(c.category, 13)} ${c.summary.slice(0, 80)}`);
}

if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") help();
else if (cmd === "list" || cmd === "ls") list(args[0]);
else if (cmd === "docs" || cmd === "doc") docs(args.join(" "));
else if (cmd === "search") search(args.join(" "));
else (console.error(`Unknown command "${cmd}".\n`), help(), process.exit(1));
