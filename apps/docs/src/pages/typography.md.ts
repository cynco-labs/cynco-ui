import type { APIRoute } from "astro";
import { typographyMarkdown } from "../lib/typography";

export const GET: APIRoute = () =>
	new Response(typographyMarkdown(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
