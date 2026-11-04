import type { APIRoute } from "astro";
import { guides } from "../lib/guides";
import { GUIDES } from "../lib/nav";
import { registry } from "../lib/registry";
import type { SearchDoc } from "../lib/search";

/** How much of a component's "Use" paragraph is searchable. */
const USE_CHARS = 200;

const headingsOf = (body: string) => [...body.matchAll(/^#{2,4}\s+(.+?)\s*$/gm)].map((m) => m[1].replace(/[`*]/g, ""));

/**
 * The search index the ⌘K palette fetches once, on first open. Built here so the ranking in
 * lib/search.ts has the same text the pages show.
 */
export const GET: APIRoute = async () => {
	const bodies = new Map((await guides()).map((g) => [`/${g.id}`, g.body ?? ""]));
	const docs: SearchDoc[] = [
		...GUIDES.flatMap((section) =>
			section.items.map((item) => ({
				id: `guide${item.href}`,
				kind: "guide" as const,
				title: item.label,
				href: item.href,
				group: section.section,
				hint: "Guide",
				terms: headingsOf(bodies.get(item.href) ?? ""),
				text: item.description,
			})),
		),
		...registry.map((c) => ({
			id: `component/${c.slug}`,
			kind: "component" as const,
			title: c.name,
			href: `/components/${c.slug}`,
			group: c.category,
			hint: c.group && c.group !== c.category ? `${c.category} · ${c.group}` : c.category,
			terms: [c.category, c.group].filter((t, i, all) => t && all.indexOf(t) === i),
			text: `${c.summary} ${c.use.slice(0, USE_CHARS)}`.trim(),
		})),
	];
	return new Response(JSON.stringify({ docs }), {
		headers: { "content-type": "application/json; charset=utf-8" },
	});
};
