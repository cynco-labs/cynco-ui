import type { APIRoute, GetStaticPaths } from "astro";
import { changelogEntry, guideMarkdown, guides } from "../lib/guides";

export const getStaticPaths: GetStaticPaths = async () =>
	(await guides()).map((g) => ({
		params: { guide: g.id },
		props: { title: g.data.title, description: g.data.description, id: g.id, body: g.body ?? "" },
	}));

export const GET: APIRoute = async ({ props }) => {
	const body = props.id === "changelog" ? ((await changelogEntry()).body ?? "") : props.body;
	return new Response(guideMarkdown(props.title, props.description, body), {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
};
