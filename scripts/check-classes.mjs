#!/usr/bin/env node
/**
 * Enforces the class-name rules in AGENTS.md across packages/ui/src.
 *
 *   node scripts/check-classes.mjs [--allow scripts/check-classes.allow] [--quiet]
 *
 * Tailwind utilities live inside string literals, so a type-checker cannot see them and Biome will not either.
 * This walks each .tsx file, collects every string literal with its line, and tests the ones that carry classes.
 * Exits non-zero on any violation, printing `file:line:match` per hit plus totals by rule and by file.
 *
 * Rules marked `classContext` are tested only inside className/class attributes and cn()/cva() style calls, where
 * a hex colour can only be a colour. The rest are tested in every string literal, because class lists are also
 * held in plain consts (`const ROW = "flex items-center gap-3"`) that no attribute or call wraps.
 *
 * Justified exceptions go in the allow file, one `path:pattern # reason` per line; see ALLOW FORMAT below.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "packages/ui/src");
const DEFAULT_ALLOW = join(ROOT, "scripts/check-classes.allow");

/** Calls whose string arguments are class lists. */
const CLASS_CALLS = new Set(["cn", "cva", "clsx", "cx", "twMerge", "tv"]);

/** Tailwind palette families the theme replaces with semantic tokens. */
const PALETTE =
	"gray|zinc|neutral|slate|stone|red|orange|amber|yellow|green|emerald|sky|blue|violet|purple|fuchsia|pink";
const PALETTE_PREFIX = "text|bg|border|fill|stroke|ring|from|to";

/** Type classes from the pre-token scale. Longest first, so `text-main-sec` does not match as `text-main`. */
const LEGACY_TYPE = [
	"giga",
	"main",
	"main-sec",
	"sub",
	"sub-secondary",
	"body",
	"body-highlight",
	"body-secondary",
	"body-sec-paragraph",
	"tiny",
	"tiny-id",
	"checkbox-label",
	"checkbox-descr",
	"checkbox-disabled",
	"form-text",
	"form-label",
	"form-placeholder",
]
	.sort((a, b) => b.length - a.length)
	.join("|");

/** A hex colour has 3, 4, 6 or 8 digits; `#1234` is RGBA, `#12345` is nothing. */
const HEX_LENGTHS = new Set([3, 4, 6, 8]);

/**
 * `classContext` limits a rule to className/class attributes and class-helper calls.
 * `skipDir` exempts a subtree. `accept` gets the match and its whitespace-delimited token for a final say.
 */
const RULES = [
	{
		id: "hex-colour",
		why: "Colours come from the theme; chart fills use var(--chart-series-N).",
		re: /#[0-9a-fA-F]{3,8}\b/g,
		classContext: true,
		accept: (m, token) => HEX_LENGTHS.has(m.length - 1) && !token.includes("var(--chart-series-"),
	},
	{
		id: "palette-colour",
		why: "Tailwind palette colours bypass the theme.",
		re: new RegExp(`\\b(?:${PALETTE_PREFIX})-(?:${PALETTE})-\\d{2,3}\\b`, "g"),
	},
	{
		id: "arbitrary-type-size",
		why: "Type comes from the scale: text-2xs through text-xl, text-display.",
		re: /text-\[\d+(?:\.\d+)?px\]/g,
	},
	{
		id: "important-utility",
		why: "An important utility means a specificity fight the component should win by structure.",
		re: /(?<![\w!])(!?[a-z@][\w@./%&>*[\]:-]*[a-z0-9\])%]!?)(?![\w!=])/g,
		accept: (m) => {
			const bang = m.startsWith("!") ? "prefix" : m.endsWith("!") ? "suffix" : null;
			if (!bang) return false;
			const body = m.replace(/^!/, "").replace(/!$/, "");
			// A utility has a dash or a bracket. `done!` and `!important` on their own do not.
			return /[-[]/.test(body) && body !== "important";
		},
	},
	{
		id: "legacy-type-class",
		why: "Type classes from the pre-token scale.",
		re: new RegExp(`\\btext-(?:${LEGACY_TYPE})\\b`, "g"),
	},
	{
		id: "breakpoint-prefix",
		why: "Components size by container (@sm:…@3xl:), not by viewport.",
		re: /(?<![@\w])(?:max-)?(?:sm|md|lg|xl|2xl):/g,
		skipDir: join(SRC, "documents"),
	},
	{
		id: "transition-all",
		why: "Name the properties that animate, so the browser is not asked to watch every one.",
		re: /\btransition-all\b/g,
	},
];

/* ---------------------------------------------------------------- scanning */

/**
 * Collects every string literal in a TSX source, with its 1-based line and whether it sits in a class context.
 * Template literals contribute their text chunks; the expressions between `${` and `}` are scanned as code.
 */
function stringLiterals(src) {
	const out = [];
	let line = 1;
	let depth = 0; // bracket depth in code
	const contexts = []; // depths at which a class context opened
	const templates = []; // brace depths of enclosing `${`
	let ident = ""; // last identifier seen in code, for `cn(`
	let prevSig = ""; // last significant code char, to tell regex from division
	let i = 0;

	const inContext = () => contexts.length > 0;
	const bump = (text) => {
		for (let k = 0; k < text.length; k++) if (text[k] === "\n") line++;
	};

	/** Reads a quoted string starting at the opening quote; returns the index after the closing quote. */
	const readQuoted = (start, quote) => {
		const begin = line;
		let value = "";
		let j = start + 1;
		for (; j < src.length; j++) {
			const c = src[j];
			if (c === "\\") {
				value += src[j + 1] ?? "";
				j++;
				continue;
			}
			if (c === quote) break;
			if (c === "\n") line++;
			value += c;
		}
		out.push({ value, line: begin, context: inContext() });
		return j + 1;
	};

	while (i < src.length) {
		const c = src[i];

		if (c === "\n") {
			line++;
			i++;
			continue;
		}

		if (c === "/" && src[i + 1] === "/") {
			const end = src.indexOf("\n", i);
			i = end === -1 ? src.length : end;
			continue;
		}

		if (c === "/" && src[i + 1] === "*") {
			const end = src.indexOf("*/", i + 2);
			const stop = end === -1 ? src.length : end + 2;
			bump(src.slice(i, stop));
			i = stop;
			continue;
		}

		// A regex literal, where a `/` cannot be division. Must close on its own line, or it is division after all.
		if (c === "/" && (prevSig === "" || "(,=:[!&|?{};+-*%^~".includes(prevSig))) {
			const eol = src.indexOf("\n", i);
			const limit = eol === -1 ? src.length : eol;
			let j = i + 1;
			let closed = false;
			for (; j < limit; j++) {
				if (src[j] === "\\") {
					j++;
					continue;
				}
				if (src[j] === "[") {
					while (j < limit && src[j] !== "]") j += src[j] === "\\" ? 2 : 1;
					continue;
				}
				if (src[j] === "/") {
					closed = true;
					break;
				}
			}
			if (closed) {
				prevSig = "/";
				i = j + 1;
				continue;
			}
		}

		if (c === '"' || c === "'") {
			i = readQuoted(i, c);
			prevSig = c;
			continue;
		}

		if (c === "`") {
			const begin = line;
			let value = "";
			let j = i + 1;
			for (; j < src.length; j++) {
				const ch = src[j];
				if (ch === "\\") {
					value += src[j + 1] ?? "";
					j++;
					continue;
				}
				if (ch === "`") break;
				if (ch === "$" && src[j + 1] === "{") {
					out.push({ value, line: begin, context: inContext() });
					value = "";
					templates.push(depth);
					depth++;
					j++;
					i = j + 1;
					prevSig = "{";
					break;
				}
				if (ch === "\n") line++;
				value += ch;
			}
			if (src[j] === "$") continue; // handed back to the code walker inside `${`
			out.push({ value, line: begin, context: inContext() });
			i = j + 1;
			prevSig = "`";
			continue;
		}

		if (/[A-Za-z_$]/.test(c)) {
			let j = i;
			while (j < src.length && /[\w$]/.test(src[j])) j++;
			ident = src.slice(i, j);
			prevSig = "a";
			// `className=` / `class=` followed by a quote: that one string is class content.
			if (ident === "className" || ident === "class") {
				let k = j;
				while (k < src.length && /\s/.test(src[k])) k++;
				if (src[k] === "=") {
					k++;
					while (k < src.length && /\s/.test(src[k])) k++;
					if (src[k] === '"' || src[k] === "'") {
						contexts.push(depth);
						bump(src.slice(i, k));
						i = readQuoted(k, src[k]);
						contexts.pop();
						prevSig = '"';
						continue;
					}
					if (src[k] === "{") {
						contexts.push(depth + 1);
						depth++;
						bump(src.slice(i, k));
						i = k + 1;
						prevSig = "{";
						continue;
					}
				}
			}
			i = j;
			continue;
		}

		if (c === "(" || c === "[" || c === "{") {
			depth++;
			if (c === "(" && CLASS_CALLS.has(ident)) contexts.push(depth);
			ident = "";
			prevSig = c;
			i++;
			continue;
		}

		if (c === ")" || c === "]" || c === "}") {
			if (c === "}" && templates.length && templates[templates.length - 1] === depth - 1) {
				// Back into the template literal this `${` interrupted.
				templates.pop();
				depth--;
				const begin = line;
				let value = "";
				let j = i + 1;
				for (; j < src.length; j++) {
					const ch = src[j];
					if (ch === "\\") {
						value += src[j + 1] ?? "";
						j++;
						continue;
					}
					if (ch === "`") break;
					if (ch === "$" && src[j + 1] === "{") {
						out.push({ value, line: begin, context: inContext() });
						value = "";
						templates.push(depth);
						depth++;
						i = j + 2;
						prevSig = "{";
						break;
					}
					if (ch === "\n") line++;
					value += ch;
				}
				if (src[j] === "$") continue;
				out.push({ value, line: begin, context: inContext() });
				i = j + 1;
				prevSig = "`";
				continue;
			}
			depth--;
			while (contexts.length && contexts[contexts.length - 1] > depth) contexts.pop();
			ident = "";
			prevSig = c;
			i++;
			continue;
		}

		if (!/\s/.test(c)) {
			prevSig = c;
			ident = "";
		}
		i++;
	}
	return out;
}

/** The whitespace-delimited token a match sits inside, so a rule can judge the whole utility. */
function tokenAt(value, index) {
	let start = index;
	while (start > 0 && !/\s/.test(value[start - 1])) start--;
	let end = index;
	while (end < value.length && !/\s/.test(value[end])) end++;
	return value.slice(start, end);
}

function violations(file, rel, src) {
	const found = [];
	const strings = stringLiterals(src);
	for (const rule of RULES) {
		if (rule.skipDir && (file === rule.skipDir || file.startsWith(rule.skipDir + sep))) continue;
		for (const s of strings) {
			if (rule.classContext && !s.context) continue;
			rule.re.lastIndex = 0;
			for (const m of s.value.matchAll(rule.re)) {
				const text = m[1] ?? m[0];
				if (rule.accept && !rule.accept(text, tokenAt(s.value, m.index))) continue;
				found.push({ file: rel, line: s.line, rule: rule.id, match: text });
			}
		}
	}
	return found;
}

/* ------------------------------------------------------------- allow file */

/**
 * ALLOW FORMAT: one `path:pattern # reason` per line, `#` comments and blank lines ignored.
 *   packages/ui/src/base/chart.tsx:hex-colour   # recharts needs a literal stop colour
 *   packages/ui/src/layout/print.tsx:md:        # the print sheet is viewport-sized by definition
 * `path` matches a file exactly or as a directory prefix. `pattern` matches a rule id or the matched text.
 * The reason is required: an exception nobody can explain is a violation with better manners.
 */
function readAllow(path) {
	let text;
	try {
		text = readFileSync(path, "utf8");
	} catch {
		return { entries: [], errors: [] };
	}
	const entries = [];
	const errors = [];
	text.split("\n").forEach((raw, n) => {
		const line = raw.trim();
		if (!line || line.startsWith("#")) return;
		const hash = line.indexOf("#");
		if (hash === -1 || !line.slice(hash + 1).trim()) {
			errors.push(`${relative(ROOT, path)}:${n + 1}: needs a trailing "# reason"`);
			return;
		}
		const rule = line.slice(0, hash).trim();
		const colon = rule.indexOf(":");
		if (colon <= 0 || colon === rule.length - 1) {
			errors.push(`${relative(ROOT, path)}:${n + 1}: expected "path:pattern # reason"`);
			return;
		}
		entries.push({ path: rule.slice(0, colon), pattern: rule.slice(colon + 1), line: n + 1, used: false });
	});
	return { entries, errors };
}

const allows = (entry, v) =>
	(v.file === entry.path || v.file.startsWith(`${entry.path.replace(/\/$/, "")}/`)) &&
	(v.rule === entry.pattern || v.match === entry.pattern || v.match.includes(entry.pattern));

/* ----------------------------------------------------------------- report */

function* tsxFiles(dir) {
	for (const name of readdirSync(dir).sort()) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) yield* tsxFiles(full);
		else if (name.endsWith(".tsx") && !name.endsWith(".test.tsx")) yield full;
	}
}

const args = process.argv.slice(2);
const allowPath = args.includes("--allow") ? resolve(args[args.indexOf("--allow") + 1]) : DEFAULT_ALLOW;
const quiet = args.includes("--quiet");

const { entries, errors } = readAllow(allowPath);
const all = [];
let scanned = 0;
for (const file of tsxFiles(SRC)) {
	scanned++;
	const rel = relative(ROOT, file);
	for (const v of violations(file, rel, readFileSync(file, "utf8"))) {
		const entry = entries.find((e) => allows(e, v));
		if (entry) {
			entry.used = true;
			continue;
		}
		all.push(v);
	}
}

if (!quiet) for (const v of all) console.log(`${v.file}:${v.line}:${v.match}  [${v.rule}]`);

const tally = (key) =>
	[...all.reduce((m, v) => m.set(v[key], (m.get(v[key]) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]);

console.log(`\nScanned ${scanned} files under packages/ui/src.`);
if (all.length) {
	console.log(`\nBy rule:`);
	for (const [rule, n] of tally("rule")) console.log(`  ${String(n).padStart(5)}  ${rule}`);
	console.log(`\nBy file:`);
	for (const [file, n] of tally("file")) console.log(`  ${String(n).padStart(5)}  ${file}`);
}
for (const e of entries.filter((e) => !e.used)) {
	console.log(`${relative(ROOT, allowPath)}:${e.line}: allow entry matches nothing; remove it`);
}
for (const e of errors) console.log(e);

console.log(`\n${all.length} violation${all.length === 1 ? "" : "s"}.`);
process.exit(all.length || errors.length ? 1 : 0);
