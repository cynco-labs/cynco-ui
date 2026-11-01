import type { APIRoute, GetStaticPaths } from "astro";
import { registry } from "../../lib/registry";
import { readUi } from "../../lib/paths";

export const getStaticPaths: GetStaticPaths = () => registry.map((c) => ({ params: { slug: c.slug } }));

export const GET: APIRoute = ({ params }) => {
	const md = readUi(`registry/docs/${params.slug}.md`);
	if (!md) return new Response("Not found", { status: 404 });
	return new Response(md, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
