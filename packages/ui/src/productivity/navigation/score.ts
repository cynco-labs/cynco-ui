/**
 * Cynco UI — how the command palette ranks what you typed against an item's fields.
 *
 * Exact and prefix hits beat word-boundary hits, which beat a scattered subsequence; every token in
 * the query must hit something, so "inv ali" finds "Invoice · Ali Trading" and not every invoice.
 */
import { parseAmount } from "../../lib/shared";

export const fold = (s: string) =>
	s
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "");
const BOUNDARY = /[\s\-_/.,:#·()&]/;

/** Subsequence match ("jrnl" → "journal entries"): 10–45, higher when the letters sit close together. */
function subsequenceScore(token: string, field: string): number {
	let fi = field.indexOf(token[0]);
	if (fi < 0) return 0;
	// The first letter must start a word, or matches get noisy.
	while (fi > 0 && !BOUNDARY.test(field[fi - 1])) {
		fi = field.indexOf(token[0], fi + 1);
		if (fi < 0) return 0;
	}
	const start = fi;
	for (let ti = 1; ti < token.length; ti++) {
		fi = field.indexOf(token[ti], fi + 1);
		if (fi < 0) return 0;
	}
	const span = fi - start + 1;
	return Math.round(10 + 35 * (token.length / span));
}

/** Best score of one query token against a record's fields (0 = no match). */
function scoreToken(token: string, fields: string[], amount?: string): number {
	let best = 0;
	const numeric = /^(rm)?[\d,]+(\.\d+)?k?$/.test(token);
	if (numeric && amount) {
		const parsed = parseAmount(token.replace(/^rm/, ""));
		if (parsed.ok && Number(parsed.value) === Number(amount)) best = 120;
		const plain = token.replace(/^rm/, "").replace(/,/g, "");
		if (!best && amount.replace(/,/g, "").startsWith(plain)) best = 70;
	}
	for (const f of fields) {
		const i = f.indexOf(token);
		if (i === 0) best = Math.max(best, 100);
		else if (i > 0) best = Math.max(best, BOUNDARY.test(f[i - 1]) ? 80 : 45);
		else if (!numeric && token.length >= 2) best = Math.max(best, subsequenceScore(token, f));
		if (best >= 100) break;
	}
	return best;
}

/** All tokens must match somewhere; the sum ranks results. */
export function scoreFields(query: string, fields: string[], amount?: string): number {
	const tokens = fold(query).split(/\s+/).filter(Boolean);
	if (!tokens.length) return 1;
	const folded = fields.filter(Boolean).map(fold);
	// Acronyms: "gl" → General ledger, "pl" → Profit & loss.
	for (const f of [...folded]) {
		const initials = f
			.split(/[\s\-_/&]+/)
			.filter(Boolean)
			.map((w) => w[0])
			.join("");
		if (initials.length > 1) folded.push(initials);
	}
	let total = 0;
	for (const t of tokens) {
		const s = scoreToken(t, folded, amount);
		if (!s) return 0;
		total += s;
	}
	// Whole query is the start of the label: float it to the top.
	if (folded[0]?.startsWith(fold(query.trim()))) total += 30;
	return total;
}
