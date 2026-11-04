import type { APIRoute } from "astro";

/**
 * Open to every crawler. The content signals (contentsignals.org) say the docs may be indexed for search and used
 * to ground AI answers; training is left unsaid, which neither grants nor refuses it.
 */
export const GET: APIRoute = ({ site }) =>
	new Response(
		[
			"User-agent: *",
			"Content-Signal: search=yes, ai-input=yes",
			"Allow: /",
			"",
			`Sitemap: ${site ? new URL("/sitemap.xml", site).href : "/sitemap.xml"}`,
			"",
		].join("\n"),
		{ headers: { "Content-Type": "text/plain; charset=utf-8" } },
	);
