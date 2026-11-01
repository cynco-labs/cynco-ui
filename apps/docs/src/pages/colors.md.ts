import type { APIRoute } from "astro";
import { colorsMarkdown } from "../lib/tokens";

export const GET: APIRoute = () => new Response(colorsMarkdown(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
