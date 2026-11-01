import type { APIRoute } from "astro";
import { CATEGORIES, byCategory } from "../lib/registry";
import { GUIDES } from "../lib/nav";

export const GET: APIRoute = ({ site }) => {
	const abs = (p: string) => (site ? new URL(p, site).href : p);
	const l = [
		"# Cynco UI",
		"",
		"> The design system for accounting and ERP software: React components, layout primitives, productivity patterns and printable business documents (@cynco-labs/ui). Every page below is Markdown.",
		"",
		"Install with `pnpm add @cynco-labs/ui @phosphor-icons/react`, then `@import \"tailwindcss\"; @import \"@cynco-labs/ui/theme.css\";`. AI components import from `@cynco-labs/ui/ai`.",
		"",
	];
	for (const g of GUIDES) {
		l.push(`## ${g.section}`, "");
		for (const i of g.items) l.push(`- [${i.label}](${abs(i.href === "/" ? "/index.md" : `${i.href}.md`)}): ${i.description}`);
		l.push("");
	}
	l.push("## Components", "", `- [All components](${abs("/components.md")}): every component by category, with summaries.`, "");
	for (const c of CATEGORIES) {
		l.push(`### ${c.name}`, "");
		for (const i of byCategory(c.name)) l.push(`- [${i.name}](${abs(`/components/${i.slug}.md`)}): ${i.summary.replace(/\s+/g, " ")}`);
		l.push("");
	}
	return new Response(l.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
