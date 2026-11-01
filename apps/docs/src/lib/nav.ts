import { CATEGORIES, GROUPED, byCategory, groupsOf, registry } from "./registry";

export interface NavItem {
	label: string;
	href: string;
	description: string;
}

export const GUIDES: { section: string; items: NavItem[] }[] = [
	{
		section: "Getting started",
		items: [
			{ label: "Introduction", href: "/", description: "What Cynco UI is, what is in it and the principles behind it." },
			{ label: "Installation", href: "/installation", description: "Install the package, set up Tailwind or the standalone CSS, fonts, themes and providers." },
			{ label: "CLI", href: "/cli", description: "Browse components and their docs from the terminal." },
			{ label: "Changelog", href: "/changelog", description: "Release notes for @cynco-labs/ui." },
		],
	},
	{
		section: "Foundations",
		items: [
			{ label: "Colors", href: "/colors", description: "Every colour token, per theme, with what it is for." },
			{ label: "Typography", href: "/typography", description: "Inter and JetBrains Mono, the type classes, sizes and weights." },
			{ label: "Layout", href: "/layout", description: "Container queries, the layout primitives and the rules that keep screens working from 320px up." },
			{ label: "Accessibility", href: "/accessibility", description: "Keyboard, focus, labels, contrast and status without colour alone." },
			{ label: "Documents", href: "/documents", description: "The document kit: brand, layouts, languages, print and PDF." },
		],
	},
];

export const COMPONENT_NAV = CATEGORIES.map((cat) => ({
	section: cat.name,
	grouped: GROUPED.has(cat.name),
	groups: GROUPED.has(cat.name)
		? groupsOf(cat.name)
		: [{ group: cat.name, items: byCategory(cat.name) }],
}));

/** Every page in reading order, for previous/next links. */
export const ORDER: { label: string; href: string }[] = [
	...GUIDES.flatMap((g) => g.items.map(({ label, href }) => ({ label, href }))),
	{ label: "All components", href: "/components" },
	...registry.map((c) => ({ label: c.name, href: `/components/${c.slug}` })),
];

export function neighbours(href: string) {
	const i = ORDER.findIndex((p) => p.href === href);
	return { prev: i > 0 ? ORDER[i - 1] : undefined, next: i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : undefined };
}
