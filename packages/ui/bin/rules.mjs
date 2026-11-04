/**
 * The Cynco UI source rules, shared by the repo's `pnpm check:classes` and the shipped `cynco-ui check`.
 *
 * Tailwind utilities live inside string literals, so a type-checker cannot see them and Biome will not either.
 * This walks each file, collects every string literal with its line, and tests the ones that carry classes.
 *
 * A rule's `in` says where it looks:
 *   "class"  className/class attributes and cn()/cva() style calls only, where a hex colour can only be a colour.
 *   "string" every string literal, because class lists are also held in plain consts
 *            (`const ROW = "flex items-center gap-3"`) that no attribute or call wraps.
 *   "code"   each source line outside comments, for rules about calls rather than classes.
 *
 * Justified exceptions go in an allow file, one `path:pattern # reason` per line; see ALLOW FORMAT below.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** Calls whose string arguments are class lists. */
const CLASS_CALLS = new Set(["cn", "cva", "clsx", "cx", "twMerge", "tv"]);

/** Tailwind palette families the theme replaces with semantic tokens. */
const PALETTE =
	"gray|zinc|neutral|slate|stone|red|orange|amber|yellow|green|emerald|sky|blue|violet|purple|fuchsia|pink";
const PALETTE_PREFIX = "text|bg|border|fill|stroke|ring|from|to";

/** A hex colour has 3, 4, 6 or 8 digits; `#1234` is RGBA, `#12345` is nothing. */
const HEX_LENGTHS = new Set([3, 4, 6, 8]);

/** Names that hold an amount when they reach parseFloat or Number(). */
const MONEY_NAMES = "amount|total|subtotal|price|balance|debit|credit|gross|fee";

/** `accept` gets the match and its whitespace-delimited token for a final say. */
export const RULES = [
	{
		id: "hex-colour",
		why: "Colours come from the theme; chart fills use var(--chart-series-N).",
		re: /#[0-9a-fA-F]{3,8}\b/g,
		in: "class",
		accept: (m, token) => HEX_LENGTHS.has(m.length - 1) && !token.includes("var(--chart-series-"),
	},
	{
		id: "palette-colour",
		why: "Tailwind palette colours bypass the theme.",
		re: new RegExp(`\\b(?:${PALETTE_PREFIX})-(?:${PALETTE})-\\d{2,3}\\b`, "g"),
		in: "string",
	},
	{
		id: "arbitrary-type-size",
		why: "Type comes from the scale: text-2xs through text-xl, text-display.",
		re: /text-\[\d+(?:\.\d+)?px\]/g,
		in: "string",
	},
	{
		id: "important-utility",
		why: "An important utility means a specificity fight the component should win by structure.",
		re: /(?<![\w!])(!?[a-z@][\w@./%&>*[\]:-]*[a-z0-9\])%]!?)(?![\w!=])/g,
		in: "string",
		accept: (m) => {
			const bang = m.startsWith("!") ? "prefix" : m.endsWith("!") ? "suffix" : null;
			if (!bang) return false;
			const body = m.replace(/^!/, "").replace(/!$/, "");
			// A utility has a dash or a bracket. `done!` and `!important` on their own do not.
			return /[-[]/.test(body) && body !== "important";
		},
	},
	{
		id: "breakpoint-prefix",
		why: "Components size by container (@sm:…@3xl:), not by viewport.",
		re: /(?<![@\w])(?:max-)?(?:sm|md|lg|xl|2xl):/g,
		in: "string",
	},
	{
		id: "container-shrink",
		why: "A box sized by its content cannot be a size container: @container measures its width and finds zero.",
		// Over the whole class list, across lines, and for named containers (`@container/card`) too.
		re: /^(?=[\s\S]*(?:^|\s)@container(?:\/[\w-]+)?(?:\s|$))(?=[\s\S]*(?:^|\s)(?:w-fit|w-max|inline-block|inline-flex|inline-grid)(?:\s|$))[\s\S]+$/g,
		in: "string",
	},
	{
		id: "transition-all",
		why: "Name the properties that animate, so the browser is not asked to watch every one.",
		re: /\btransition-all\b/g,
		in: "string",
	},
	{
		id: "float-money",
		why: "Amounts are decimal strings: parseAmount to read, sumAmounts to add, formatCurrency to show.",
		re: new RegExp(`\\b(?:parseFloat|(?<!\\.)Number)\\([^)]*?(?:${MONEY_NAMES})|\\.toFixed\\(2\\)`, "gi"),
		in: "code",
	},
];

/** The rules `cynco-ui check` runs in an app. A page shell is sized by the window, so viewport breakpoints are fine there. */
export const APP_RULES = RULES.filter((r) => r.id !== "breakpoint-prefix");

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

/** Source lines outside comments, with their 1-based numbers, for the "code" rules. */
function codeLines(src) {
	let inBlock = false;
	return src.split("\n").flatMap((text, i) => {
		const t = text.trim();
		if (inBlock) {
			if (t.includes("*/")) inBlock = false;
			return [];
		}
		if (t.startsWith("/*")) {
			inBlock = !t.includes("*/");
			return [];
		}
		return t.startsWith("//") ? [] : [{ value: text, line: i + 1 }];
	});
}

/** Every rule hit in one source, as `{ file, line, rule, match, why }`. */
export function violations(file, src, rules = RULES) {
	const found = [];
	const strings = stringLiterals(src);
	const lines = rules.some((r) => r.in === "code") ? codeLines(src) : [];
	for (const rule of rules) {
		const targets = rule.in === "code" ? lines : rule.in === "class" ? strings.filter((s) => s.context) : strings;
		for (const s of targets) {
			rule.re.lastIndex = 0;
			for (const m of s.value.matchAll(rule.re)) {
				const text = m[1] ?? m[0];
				if (rule.accept && !rule.accept(text, tokenAt(s.value, m.index))) continue;
				found.push({ file, line: s.line, rule: rule.id, match: text, why: rule.why });
			}
		}
	}
	return found;
}

/** Files under `dir` with one of `exts`, skipping tests, declarations and the directories named in `skip`. */
export function* sourceFiles(dir, exts, skip = new Set()) {
	for (const name of readdirSync(dir).sort()) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) {
			if (!skip.has(name) && !name.startsWith(".")) yield* sourceFiles(full, exts, skip);
		} else if (exts.some((e) => name.endsWith(e)) && !/\.(test|spec|d)\.[cm]?[jt]sx?$/.test(name)) yield full;
	}
}

/* ------------------------------------------------------------- allow file */

/**
 * ALLOW FORMAT: one `path:pattern # reason` per line, `#` comments and blank lines ignored.
 *   packages/ui/src/base/chart.tsx:hex-colour   # recharts needs a literal stop colour
 *   packages/ui/src/layout/print.tsx:md:        # the print sheet is viewport-sized by definition
 * `path` matches a file exactly or as a directory prefix. `pattern` matches a rule id or the matched text.
 * The reason is required: an exception nobody can explain is a violation with better manners.
 */
export function readAllow(path, label = path) {
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
			errors.push(`${label}:${n + 1}: needs a trailing "# reason"`);
			return;
		}
		const rule = line.slice(0, hash).trim();
		const colon = rule.indexOf(":");
		if (colon <= 0 || colon === rule.length - 1) {
			errors.push(`${label}:${n + 1}: expected "path:pattern # reason"`);
			return;
		}
		entries.push({ path: rule.slice(0, colon), pattern: rule.slice(colon + 1), line: n + 1, used: false });
	});
	return { entries, errors };
}

/** Whether an allow entry's path names this file, exactly or as a directory prefix. */
const covers = (entry, file) => file === entry.path || file.startsWith(`${entry.path.replace(/\/$/, "")}/`);

export const allows = (entry, v) =>
	covers(entry, v.file) && (v.rule === entry.pattern || v.match === entry.pattern || v.match.includes(entry.pattern));

/* ----------------------------------------------------------------- report */

/**
 * Scans `files` (paths on disk, found under `roots`, which are in `rel` form) with the rules `rulesFor` gives each
 * one, drops what the allow file excuses,
 * prints every violation with the reason for its rule, and returns the exit code: 1 on a violation, a malformed
 * allow line or an allow entry that matches nothing, so the allow file cannot rot.
 */
export function check({ files, roots, rel, rulesFor, allowPath, allowLabel = allowPath, where, quiet = false }) {
	const { entries, errors } = readAllow(allowPath, allowLabel);
	const scanned = files.map(rel);
	// Only an entry under a path this run checked can be stale: checking one file says nothing about the others, but
	// an entry for a file deleted from a checked directory is exactly the rot the rule exists to catch.
	const inScope = entries.filter((e) => roots.some((r) => r === "" || r === "." || covers({ path: r }, e.path)));
	const all = [];
	for (const [i, file] of files.entries()) {
		for (const v of violations(scanned[i], readFileSync(file, "utf8"), rulesFor(file))) {
			const entry = entries.find((e) => allows(e, v));
			if (entry) entry.used = true;
			else all.push(v);
		}
	}

	all.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
	if (!quiet) for (const v of all) console.log(`${v.file}:${v.line}:${v.match}  [${v.rule}]`);

	const tally = (key) =>
		[...all.reduce((m, v) => m.set(v[key], (m.get(v[key]) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]);

	console.log(`\nScanned ${files.length} file${files.length === 1 ? "" : "s"} under ${where}.`);
	if (all.length) {
		const why = new Map(all.map((v) => [v.rule, v.why]));
		console.log("\nBy rule:");
		for (const [rule, n] of tally("rule")) console.log(`  ${String(n).padStart(5)}  ${rule}: ${why.get(rule)}`);
		console.log("\nBy file:");
		for (const [file, n] of tally("file")) console.log(`  ${String(n).padStart(5)}  ${file}`);
	}
	const stale = inScope.filter((e) => !e.used);
	for (const e of stale) console.log(`${allowLabel}:${e.line}: allow entry matches nothing; remove it`);
	for (const e of errors) console.log(e);

	console.log(`\n${all.length} violation${all.length === 1 ? "" : "s"}.`);
	return all.length || errors.length || stale.length ? 1 : 0;
}
