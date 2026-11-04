// Ranked component search for the cynco-ui CLI. Pure, so it can be tested without spawning the CLI.

// Words split on case and punctuation ("DataTable" → data, table), each reduced to a light stem so
// "reconcile" finds "reconciliation" and "dates" finds "date".
const STOP = new Set(["a", "an", "and", "for", "in", "of", "on", "or", "the", "to", "with"]);
const words = (s) =>
	s
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean);
const stem = (w) => (w.length > 3 ? w.replace(/(iation|ation|ing|ion|ed|es|s|e)$/, "") : w);
const matches = (token, word) => stem(word) === stem(token) || (token.length >= 4 && word.startsWith(token));

// Where a word is found decides how much it counts: in the name, then the group or category, then the prose.
const FIELDS = [
	["name", 10],
	["group", 3],
	["category", 3],
	["summary", 2],
	["use", 1],
];

/** Components matching the most query words, best first: a name hit outranks a description hit, and a
 *  shorter name (the primitive) outranks a longer one built on it. */
export function rank(registry, text) {
	const tokens = words(text).filter((t) => !STOP.has(t));
	const scored = registry.map((c) => {
		const fields = FIELDS.map(([key, weight]) => [words(c[key] ?? ""), weight]);
		let matched = 0;
		let score = words(c.name).join("") === tokens.join("") ? 100 : 0;
		for (const t of tokens) {
			const best = Math.max(0, ...fields.map(([ws, weight]) => (ws.some((w) => matches(t, w)) ? weight : 0)));
			if (best) matched++, (score += best);
		}
		return { c, matched, score };
	});
	const most = Math.max(0, ...scored.map((s) => s.matched));
	const hits = scored
		.filter((s) => most && s.matched === most)
		.sort((a, b) => b.score - a.score || a.c.name.length - b.c.name.length || a.c.name.localeCompare(b.c.name))
		.map((s) => s.c);
	return { hits, partial: most < tokens.length };
}
