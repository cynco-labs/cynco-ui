/**
 * Ranking for the ⌘K palette. The index is built at build time (`/search.json`) and scored here in
 * the browser; the library's CommandPalette renders whatever this returns, in this order.
 *
 * Every word of the query must match something, so "button group" finds ButtonGroup and
 * "button zzz" finds nothing. A word scores the best (field weight × match kind) it reaches, so a
 * name match always outranks the same word buried in a summary.
 */

export type SearchKind = "guide" | "component" | "action";

export interface SearchDoc {
	id: string;
	kind: SearchKind;
	/** Component name or guide title. */
	title: string;
	href: string;
	/** Heading the palette lists it under: a guide section or a component category. */
	group: string;
	/** Muted text at the right of the row. */
	hint: string;
	/** Extra words that find it: category, group, guide headings. */
	terms: string[];
	/** Summary and the start of "Use". A match here ranks below a name or term match. */
	text: string;
}

export interface SearchHit {
	doc: SearchDoc;
	score: number;
}

const TITLE = 1;
const TERMS = 0.6;
const TEXT = 0.3;

const EXACT = 100;
const PREFIX = 80;
const ACRONYM = 70;
const WORD_START = 60;
const SUBSTRING = 40;
const SUBSEQUENCE = 20;

/** Lower-case words, splitting camel case too, so "group" finds ButtonGroup. */
export function words(text: string): string[] {
	return text
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean);
}

function isSubsequence(needle: string, haystack: string): boolean {
	let i = 0;
	for (const ch of haystack) if (ch === needle[i] && ++i === needle.length) return true;
	return needle.length === 0;
}

/**
 * How well one query word matches one field: 0 when it does not. `fuzzy` allows a subsequence match,
 * which belongs on names, not on a paragraph, where almost any letters appear somewhere in order.
 */
export function matchIn(word: string, field: string, fuzzy = true): number {
	const flat = field.toLowerCase();
	if (!flat || !word) return 0;
	if (flat === word) return EXACT;
	if (flat.startsWith(word)) return PREFIX;
	const parts = words(field);
	const initials = parts.map((p) => p[0]).join("");
	if (initials.startsWith(word)) return ACRONYM;
	if (parts.some((p) => p.startsWith(word))) return WORD_START;
	if (flat.includes(word)) return SUBSTRING;
	return fuzzy && isSubsequence(word, flat) ? SUBSEQUENCE : 0;
}

function scoreWord(word: string, doc: SearchDoc): number {
	let best = TITLE * matchIn(word, doc.title);
	for (const term of doc.terms) best = Math.max(best, TERMS * matchIn(word, term));
	return Math.max(best, TEXT * matchIn(word, doc.text, false));
}

/** 0 when the document does not match every word of the query. */
export function scoreDoc(query: string, doc: SearchDoc): number {
	const terms = words(query);
	if (terms.length === 0) return 1;
	let total = 0;
	for (const word of terms) {
		const score = scoreWord(word, doc);
		if (score === 0) return 0;
		total += score;
	}
	// Spelling the name out, spaces or not, beats a component that merely holds the same words:
	// "button group" is ButtonGroup, not GroupedTabButton.
	const asked = terms.join("");
	const title = words(doc.title).join("");
	const bonus = title === asked ? 100 : title.startsWith(asked) ? 40 : 0;
	return total / terms.length + bonus;
}

/** The best `limit` documents for `query`, highest first; index order breaks ties. */
export function search(query: string, docs: readonly SearchDoc[], limit = 50): SearchHit[] {
	const hits: { doc: SearchDoc; score: number; at: number }[] = [];
	for (const [at, doc] of docs.entries()) {
		const score = scoreDoc(query, doc);
		if (score > 0) hits.push({ doc, score, at });
	}
	hits.sort((a, b) => b.score - a.score || a.at - b.at);
	return hits.slice(0, limit).map(({ doc, score }) => ({ doc, score }));
}
