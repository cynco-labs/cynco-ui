// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Set SITE_URL when deploying (used for absolute links in /llms.txt and canonical URLs).
export default defineConfig({
	site: process.env.SITE_URL ?? "https://ui.cynco.io",
	output: "static",
	trailingSlash: "ignore",
	build: { format: "file" },
	integrations: [react()],
	markdown: {
		shikiConfig: { themes: { light: "github-light", dark: "github-dark" }, defaultColor: false },
	},
	vite: {
		plugins: [tailwindcss()],
		ssr: { noExternal: ["@cynco-labs/ui"] },
		// Shiki grammars and Mermaid (used by the AI kit's Markdown) are lazy chunks, loaded only when needed.
		build: { chunkSizeWarningLimit: 2000 },
	},
	prefetch: { prefetchAll: true, defaultStrategy: "hover" },
	devToolbar: { enabled: false },
});
