import type { APIRoute } from "astro";
import skill from "../../../../packages/ui/skills/cynco-ui/SKILL.md?raw";

/** The agent skill, also shipped in the package at node_modules/@cynco-labs/ui/skills/cynco-ui/SKILL.md. */
export const GET: APIRoute = () => new Response(skill, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
