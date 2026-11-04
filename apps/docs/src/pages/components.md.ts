import type { APIRoute } from "astro";
import { byCategory, CATEGORIES, GROUPED, groupsOf, registry } from "../lib/registry";

export const GET: APIRoute = () => {
	const l = [
		`# Components`,
		"",
		`${registry.length} Cynco UI components. Import from \`@cynco-labs/ui\` (AI components from \`@cynco-labs/ui/ai\`). Each has a page at /components/<slug> and Markdown at /components/<slug>.md.`,
		"",
	];
	for (const c of CATEGORIES) {
		l.push(`## ${c.name}`, "", c.blurb, "");
		const groups = GROUPED.has(c.name) ? groupsOf(c.name) : [{ group: "", items: byCategory(c.name) }];
		for (const g of groups) {
			if (g.group) l.push(`### ${g.group}`, "");
			for (const i of g.items) l.push(`- [${i.name}](/components/${i.slug}.md): ${i.summary}`);
			l.push("");
		}
	}
	return new Response(l.join("\n"), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
