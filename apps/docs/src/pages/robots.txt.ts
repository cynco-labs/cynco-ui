import type { APIRoute } from "astro";

/**
 * Open to every crawler, AI ones included. The content signals (contentsignals.org) grant all three uses: search
 * indexing, grounding AI answers, and training, so models learn the library's API from its own docs.
 */
export const GET: APIRoute = ({ site }) =>
	new Response(
		[
			"User-agent: *",
			"Content-Signal: search=yes, ai-input=yes, ai-train=yes",
			"Allow: /",
			"",
			`Sitemap: ${site ? new URL("/sitemap.xml", site).href : "/sitemap.xml"}`,
			"",
		].join("\n"),
		{ headers: { "Content-Type": "text/plain; charset=utf-8" } },
	);
