#!/usr/bin/env node
// cynco-ui — browse Cynco UI components, read their docs, check an app against the rules and install the agent skill.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { APP_RULES, check, sourceFiles } from "./rules.mjs";
import { rank } from "./search.mjs";

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
  cynco-ui check [paths]       Check source against the rules (default: src, else .); --allow <file> for exceptions
  cynco-ui skill [dir]         Install or update the agent skill in <dir>/cynco-ui (default: .claude/skills)
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
	if (!c) {
		const close = rank(registry, q ?? "").hits.slice(0, 5);
		console.error(`Unknown component "${q ?? ""}".`);
		console.error(close.length ? `Closest: ${close.map((h) => h.name).join(", ")}` : "Try: cynco-ui search <words>");
		process.exit(1);
	}
	const md = join(root, "registry", "docs", `${c.slug}.md`);
	console.log(existsSync(md) ? readFileSync(md, "utf8") : `# ${c.name}\n\n${c.summary}\n\nimport { ${c.name} } from "${c.importFrom}";`);
}

const SHOWN = 20;

function search(text) {
	const { hits, partial } = rank(registry, text ?? "");
	if (!hits.length) return console.log("No matches. Try fewer words, or: cynco-ui list");
	if (partial) console.log("Nothing matches every word; these match the most.\n");
	for (const c of hits.slice(0, SHOWN)) console.log(`${pad(c.name, 30)} ${pad(c.category, 13)} ${c.summary.slice(0, 80)}`);
	if (hits.length > SHOWN) console.log(`… ${hits.length - SHOWN} more. Add a word to narrow it, or: cynco-ui list <category>`);
}

const CHECKED = [".tsx", ".jsx", ".ts", ".js", ".mjs"];
const NOT_SOURCE = new Set(["node_modules", "dist", "build", "out", "coverage"]);

/** Exit 1 on any rule hit, so it can gate CI or an agent's hook. Exceptions live in cynco-ui.allow by default. */
function lint(argv) {
	let allowPath = "cynco-ui.allow";
	const targets = [];
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--allow") allowPath = argv[++i];
		else targets.push(argv[i]);
	}
	if (!targets.length) targets.push(existsSync("src") ? "src" : ".");
	const missing = targets.find((t) => !existsSync(t));
	if (missing) return console.error(`No such file or directory: ${missing}`), process.exit(1);
	const files = targets.flatMap((t) => (statSync(t).isDirectory() ? [...sourceFiles(t, CHECKED, NOT_SOURCE)] : [t]));
	const rel = (file) => relative(process.cwd(), resolve(file)).split(sep).join("/");
	process.exit(
		check({
			files,
			roots: targets.map(rel),
			rel,
			rulesFor: () => APP_RULES,
			allowPath,
			where: targets.join(", "),
		}),
	);
}

/** Copies the shipped SKILL.md where agents load skills from, so it tracks the installed version. */
function skill(dir = join(".claude", "skills")) {
	const next = readFileSync(join(root, "skills", "cynco-ui", "SKILL.md"), "utf8");
	const to = join(dir, "cynco-ui", "SKILL.md");
	const prev = existsSync(to) ? readFileSync(to, "utf8") : null;
	if (prev === next) return console.log(`${to} is up to date.`);
	mkdirSync(dirname(to), { recursive: true });
	writeFileSync(to, next);
	console.log(`${prev === null ? "Installed" : "Updated"} ${to}`);
}

if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") help();
else if (cmd === "list" || cmd === "ls") list(args[0]);
else if (cmd === "docs" || cmd === "doc") docs(args.join(" "));
else if (cmd === "search") search(args.join(" "));
else if (cmd === "check") lint(args);
else if (cmd === "skill") skill(args[0]);
else (console.error(`Unknown command "${cmd}".\n`), help(), process.exit(1));
