#!/usr/bin/env node
/**
 * Rewrites the pre-token type classes (`text-body`, `text-tiny-id`, …) to the token utilities they stand for.
 *
 *   node scripts/codemods/legacy-type-classes.mjs [--dry-run] [path ...]
 *
 * Each legacy class carried a size, a weight and usually a colour in one name, so one class becomes up to three
 * utilities. Where the same class string already sets a colour or a weight of its own, that explicit utility wins
 * and the mapped one is dropped, so cn() never has two of either to resolve.
 *
 * Idempotent: the replacements contain no legacy class, so a second run finds nothing left to do.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const DEFAULT_TARGETS = ["packages/ui/src", "apps/docs/src/demos"];

/** size, weight and colour each legacy class rolled into one name. A null weight or colour means it set none. */
const MAPPING = {
	giga: { size: "text-display", weight: "font-semibold", colour: "text-foreground" },
	main: { size: "text-lg", weight: "font-semibold", colour: "text-foreground" },
	"main-sec": { size: "text-lg", weight: "font-medium", colour: "text-foreground" },
	sub: { size: "text-md", weight: "font-semibold", colour: "text-muted-foreground" },
	"sub-secondary": { size: "text-md", weight: "font-medium", colour: "text-muted-foreground" },
	body: { size: "text-sm", weight: "font-medium", colour: "text-muted-foreground" },
	"body-highlight": { size: "text-sm", weight: "font-semibold", colour: "text-muted-foreground" },
	"body-secondary": { size: "text-sm", weight: null, colour: "text-subtle" },
	"body-sec-paragraph": { size: "text-sm", weight: "font-medium", colour: "text-tertiary-foreground" },
	tiny: { size: "text-2xs", weight: null, colour: null },
	"tiny-id": { size: "text-2xs", weight: "font-medium", colour: null, extra: "font-mono" },
	"checkbox-label": { size: "text-sm", weight: "font-semibold", colour: "text-muted-foreground" },
	"checkbox-descr": { size: "text-sm", weight: "font-semibold", colour: "text-tertiary-foreground" },
	"checkbox-disabled": { size: "text-sm", weight: "font-semibold", colour: "text-placeholder" },
	"form-text": { size: "text-sm", weight: "font-medium", colour: "text-muted-foreground" },
	"form-label": { size: "text-sm", weight: "font-medium", colour: "text-muted-foreground" },
	"form-placeholder": { size: "text-sm", weight: "font-medium", colour: "text-placeholder" },
};

/** Longest name first, so `text-body-highlight` is never read as `text-body` with a suffix. */
const NAMES = Object.keys(MAPPING).sort((a, b) => b.length - a.length);
const LEGACY_RE = new RegExp(`\\btext-(${NAMES.join("|")})\\b`, "g");

/** `text-` utilities that set something other than a colour, so they do not count as an explicit colour. */
const NOT_A_COLOUR = new Set([
	"2xs",
	"xs",
	"sm",
	"md",
	"lg",
	"xl",
	"2xl",
	"3xl",
	"4xl",
	"5xl",
	"6xl",
	"7xl",
	"8xl",
	"9xl",
	"base",
	"display",
	"left",
	"center",
	"right",
	"justify",
	"start",
	"end",
	"wrap",
	"nowrap",
	"balance",
	"pretty",
	"ellipsis",
	"clip",
]);

const WEIGHT_RE = /^font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/;

const isExplicitColour = (token) => {
	if (!token.startsWith("text-") || token.includes(":") || token.includes("/")) return false;
	const rest = token.slice(5);
	return !NOT_A_COLOUR.has(rest) && !rest.startsWith("[") && !NAMES.includes(rest);
};

const isExplicitWeight = (token) => WEIGHT_RE.test(token);

/**
 * Rewrites one class string. `tokens` is the whole string's vocabulary, which is what decides whether an
 * explicit colour or weight is already present; a template literal's chunks share one vocabulary.
 */
function rewriteClassString(text, vocabulary) {
	const hasColour = vocabulary.some(isExplicitColour);
	const hasWeight = vocabulary.some(isExplicitWeight);
	return text.replace(LEGACY_RE, (_match, name) => {
		const { size, weight, colour, extra } = MAPPING[name];
		const parts = [];
		if (extra) parts.push(extra);
		parts.push(size);
		if (weight && !hasWeight) parts.push(weight);
		if (colour && !hasColour) parts.push(colour);
		return parts.join(" ");
	});
}

/**
 * String literals in a TSX source, as {start, end} spans of their contents. Template literals contribute each
 * chunk between `${…}` as its own span, and the spans of one template are grouped so they share a vocabulary.
 */
function literalSpans(src) {
	const groups = [];
	let i = 0;
	while (i < src.length) {
		const c = src[i];
		if (c === "/" && src[i + 1] === "/") {
			const end = src.indexOf("\n", i);
			i = end === -1 ? src.length : end;
			continue;
		}
		if (c === "/" && src[i + 1] === "*") {
			const end = src.indexOf("*/", i + 2);
			i = end === -1 ? src.length : end + 2;
			continue;
		}
		if (c === '"' || c === "'") {
			let j = i + 1;
			while (j < src.length && src[j] !== c) j += src[j] === "\\" ? 2 : 1;
			groups.push([{ start: i + 1, end: j }]);
			i = j + 1;
			continue;
		}
		if (c === "`") {
			const spans = [];
			let j = i + 1;
			let chunkStart = j;
			let depth = 0;
			while (j < src.length) {
				if (src[j] === "\\") {
					j += 2;
					continue;
				}
				if (depth === 0 && src[j] === "`") break;
				if (depth === 0 && src[j] === "$" && src[j + 1] === "{") {
					spans.push({ start: chunkStart, end: j });
					depth = 1;
					j += 2;
					continue;
				}
				if (depth > 0) {
					if (src[j] === "{") depth++;
					else if (src[j] === "}") {
						depth--;
						if (depth === 0) chunkStart = j + 1;
					}
				}
				j++;
			}
			if (depth === 0) spans.push({ start: chunkStart, end: j });
			groups.push(spans);
			i = j + 1;
			continue;
		}
		i++;
	}
	return groups;
}

function transform(src) {
	const edits = [];
	for (const spans of literalSpans(src)) {
		const vocabulary = spans.flatMap((s) => src.slice(s.start, s.end).split(/\s+/)).filter(Boolean);
		if (!vocabulary.some((t) => NAMES.includes(t.replace(/^text-/, "")) && t.startsWith("text-"))) continue;
		for (const span of spans) {
			const text = src.slice(span.start, span.end);
			const next = rewriteClassString(text, vocabulary);
			if (next !== text) edits.push({ ...span, next });
		}
	}
	if (!edits.length) return { text: src, count: 0 };
	let out = "";
	let cursor = 0;
	let count = 0;
	for (const edit of edits.sort((a, b) => a.start - b.start)) {
		out += src.slice(cursor, edit.start) + edit.next;
		cursor = edit.end;
		count += (src.slice(edit.start, edit.end).match(LEGACY_RE) ?? []).length;
	}
	return { text: out + src.slice(cursor), count };
}

function* tsxFiles(dir) {
	for (const name of readdirSync(dir).sort()) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) yield* tsxFiles(full);
		else if (full.endsWith(".tsx")) yield full;
	}
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const targets = args.filter((a) => !a.startsWith("--"));
let changed = 0;
let rewritten = 0;
for (const target of (targets.length ? targets : DEFAULT_TARGETS).map((t) => resolve(ROOT, t))) {
	const files = statSync(target).isDirectory() ? [...tsxFiles(target)] : [target];
	for (const file of files) {
		const src = readFileSync(file, "utf8");
		const { text, count } = transform(src);
		if (!count) continue;
		changed++;
		rewritten += count;
		console.log(`${dryRun ? "would rewrite" : "rewrote"} ${count} in ${relative(ROOT, file)}`);
		if (!dryRun) writeFileSync(file, text);
	}
}
console.log(`\n${rewritten} class${rewritten === 1 ? "" : "es"} in ${changed} file${changed === 1 ? "" : "s"}.`);
