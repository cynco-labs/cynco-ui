#!/usr/bin/env node
/**
 * Moves the printed documents onto the shared `--doc-*` tokens.
 *
 *   node scripts/codemods/doc-tokens.mjs [--check]
 *
 * Two passes over packages/ui/src/documents:
 *
 * 1. Rename the variables to the names tokens.css now declares. `--doc-rule` meant the hairline and
 *    `--doc-rule-strong` the ink rule; they become `--doc-rule-soft` and `--doc-rule`, so the pass
 *    goes through a placeholder rather than renaming one onto the other.
 * 2. Replace `text-[var(--doc-ink)]` and friends with the Tailwind utilities theme.css now generates
 *    (`text-doc-ink`, `border-doc-rule`…). Arbitrary values in a style object or a CSS string are
 *    left alone: they already read the token.
 *
 * `--check` reports what it would change and exits 1 if anything is left, so CI can hold the line.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DOCS = join(ROOT, "packages/ui/src/documents");

/** old name -> new name, applied through a placeholder so a swap cannot collide. */
const RENAMES = [
	["--doc-rule-strong", "--doc-rule"],
	["--doc-rule", "--doc-rule-soft"],
	["--doc-tint-strong", "--doc-paper-tint-strong"],
	["--doc-tint", "--doc-paper-tint"],
	["--doc-muted", "--doc-ink-muted"],
	["--doc-subtle", "--doc-ink-subtle"],
];

const TOKENS = ["ink-muted", "ink-subtle", "ink", "paper-tint-strong", "paper-tint", "paper", "rule-soft", "rule"];
/** Utility prefixes that take a colour; the longest alternative has to come first. */
const PREFIXES =
	"text|bg|border-[xytrbl]|border-[se]|border|divide|ring-offset|ring|outline|decoration|fill|stroke|placeholder|caret|shadow|from|via|to";

/** Names only the migrated vocabulary has: their presence means pass 1 has already run here. */
const MIGRATED = ["--doc-rule-soft", "--doc-paper-tint", "--doc-ink-muted", "--doc-ink-subtle"];

function renameVariables(source) {
	// `--doc-rule` is both an old name (the hairline) and a new one (the ink rule), so the rename is a
	// swap and cannot tell on its own whether it has run. Skip a file that already speaks the new names.
	if (MIGRATED.some((name) => source.includes(name))) return source;
	let out = source;
	RENAMES.forEach(([from], i) => {
		out = out.replace(new RegExp(`${from}(?![\\w-])`, "g"), `\u0000${i}\u0000`);
	});
	RENAMES.forEach(([, to], i) => {
		out = out.split(`\u0000${i}\u0000`).join(to);
	});
	return out;
}

function useUtilities(source) {
	const pattern = new RegExp(`(${PREFIXES})-\\[var\\(--doc-(${TOKENS.join("|")})\\)\\]`, "g");
	return source.replace(pattern, (_, prefix, token) => `${prefix}-doc-${token}`);
}

const check = process.argv.includes("--check");
let changed = 0;
for (const name of readdirSync(DOCS)) {
	if (!name.endsWith(".tsx") && !name.endsWith(".ts")) continue;
	const path = join(DOCS, name);
	const before = readFileSync(path, "utf8");
	const after = useUtilities(renameVariables(before));
	if (after === before) continue;
	changed += 1;
	console.log(`${check ? "would rewrite" : "rewrote"} packages/ui/src/documents/${name}`);
	if (!check) writeFileSync(path, after);
}
console.log(`${changed} file${changed === 1 ? "" : "s"}.`);
if (check && changed > 0) process.exit(1);
