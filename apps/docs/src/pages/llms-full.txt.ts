import type { APIRoute } from "astro";
import { guideMarkdown, guides } from "../lib/guides";
import { homeMarkdown } from "../lib/home";
import { GUIDES } from "../lib/nav";
import { byCategory, CATEGORIES, type RegistryEntry } from "../lib/registry";
import { colorsMarkdown } from "../lib/tokens";
import { typographyMarkdown } from "../lib/typography";

/**
 * The docs in one file, for an agent that fetches a single URL: every guide in full, then every component's
 * summary, import, when to use it and its props. Full usage examples stay on each component's .md page, which
 * this links; with them the file would pass a megabyte. The changelog is left out: it is history, not usage.
 */
export const GET: APIRoute = async ({ site }) => {
	const abs = (p: string) => (site ? new URL(p, site).href : p);
	const entries = new Map((await guides()).map((g) => [`/${g.id}`, g]));
	const pageMarkdown = (href: string) => {
		if (href === "/") return homeMarkdown();
		if (href === "/colors") return colorsMarkdown();
		if (href === "/typography") return typographyMarkdown();
		const g = entries.get(href);
		return g ? guideMarkdown(g.data.title, g.data.description, g.body ?? "") : "";
	};

	const pages = GUIDES.flatMap((s) => s.items)
		.filter((i) => i.href !== "/changelog")
		.map((i) => pageMarkdown(i.href).trim());

	const components = ["# Components", ""];
	for (const cat of CATEGORIES) {
		components.push(`## ${cat.name}`, "", cat.blurb, "");
		for (const c of byCategory(cat.name)) components.push(componentMarkdown(c, abs(`/components/${c.slug}.md`)), "");
	}

	return new Response(`${[...pages, components.join("\n").trim()].join("\n\n---\n\n")}\n`, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};

function componentMarkdown(c: RegistryEntry, docs: string) {
	const l = [`### ${c.name}`, "", c.summary, "", `\`import { ${c.name} } from "${c.importFrom}";\``];
	if (c.use) l.push("", `Use: ${c.use}`);
	if (c.props?.props.length) {
		l.push("", "Props:");
		for (const p of c.props.props) {
			const desc = p.description ? ` ${p.description}` : "";
			const dflt = p.default && !/\bDefault\b/.test(desc) ? ` Default \`${p.default}\`.` : "";
			l.push(`- \`${p.name}${p.required ? "" : "?"}\`: \`${p.type}\`.${desc}${dflt}`);
		}
		if (c.props.inherits.length) l.push(`- Also accepts ${c.props.inherits.map((i) => `\`${i}\``).join(", ")}.`);
	}
	l.push("", `Full docs and example: ${docs}`);
	return l.join("\n");
}
