import { GUIDES } from "./nav";
import { registry } from "./registry";

/** One link-preview image: the page it belongs to, its copy, and the real component shown beside it. */
export interface OgPage {
	href: string;
	eyebrow: string;
	title: string;
	description: string;
	/** Slug of the component whose live demo (/demo/<slug>) fills the stage. */
	stage: string;
	/** Width the demo lays itself out at before it is scaled into the stage. */
	width: number;
}

/** Screens read best laid out compactly and scaled up; a printed document needs its paper width to be legible. */
const widthOf = (slug: string) => (registry.find((c) => c.slug === slug)?.category === "Documents" ? 760 : 440);
const slugOf = (name: string) => registry.find((c) => c.name === name)?.slug ?? "data-list";

/** The component a guide shows, picked for what the guide is about. */
const GUIDE_STAGE: Record<string, string> = {
	"/": "BankFeedRow",
	"/installation": "DataList",
	"/cli": "AmountInput",
	"/changelog": "StatusChip",
	"/colors": "StatusChip",
	"/typography": "InvoiceTotalsPanel",
	"/layout": "KpiTileGrid",
	"/accessibility": "Calendar",
	"/documents": "ReceiptDocument",
	"/components": "DataList",
};

/** Every indexable page: the guides, the components index and each component. */
export function ogPages(): OgPage[] {
	const guides = GUIDES.flatMap((s) =>
		s.items.map((i) =>
			// The wordmark already says "Cynco UI", so the home image leads with what it is, in the hero's words.
			i.href === "/"
				? {
						href: i.href,
						eyebrow: "Design system",
						title: "Accounting and ERP interfaces",
						description: "Quiet, dense components for ledgers, invoices, bank feeds and the documents you print.",
					}
				: { href: i.href, eyebrow: s.section, title: i.label, description: i.description },
		),
	);
	const index = {
		href: "/components",
		eyebrow: "Components",
		title: "Components",
		description: `${registry.length} components for ledgers, invoices, bank feeds, payroll and printable documents.`,
	};
	return [
		...[...guides, index].map((p) => ({ ...p, stage: slugOf(GUIDE_STAGE[p.href] ?? "DataList") })),
		...registry.map((c) => ({
			href: `/components/${c.slug}`,
			eyebrow: c.group && c.group !== c.category ? `${c.category} · ${c.group}` : c.category,
			title: c.name,
			description: c.summary,
			stage: c.slug,
		})),
	].map((p) => ({ ...p, width: widthOf(p.stage) }));
}

/** The frame (and image) path for a page: "/" → "/og/index", "/components/x" → "/og/components/x". */
export const ogPath = (href: string) => `/og/${href === "/" ? "index" : href.slice(1)}`;

/** Every page that has a preview image, which is also every page the sitemap lists. */
export const OG_HREFS: ReadonlySet<string> = new Set(ogPages().map((p) => p.href));
