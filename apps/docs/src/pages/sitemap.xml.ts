import type { APIRoute } from "astro";
import { OG_HREFS } from "../lib/og";

/**
 * Every indexable page at the URL that answers 200 (no `.html`). The list is the preview images' (lib/og.ts), so a
 * page in the sitemap always has its image; demo and matrix frames are noindex and appear in neither.
 */
export const GET: APIRoute = ({ site }) => {
	const abs = (p: string) => (site ? new URL(p, site).href : p);
	const urls = [...OG_HREFS].map((p) => `\t<url><loc>${abs(p)}</loc></url>`).join("\n");
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { "Content-Type": "application/xml; charset=utf-8" } },
	);
};
