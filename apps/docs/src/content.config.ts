import { defineCollection, z } from "astro:content";
import { existsSync } from "node:fs";
import { glob } from "astro/loaders";

const guides = defineCollection({
	loader: glob({ pattern: "*.md", base: "./src/content/guides" }),
	schema: z.object({ title: z.string(), description: z.string() }),
});

/** The package's own CHANGELOG.md (written by Changesets), once it exists. */
const hasChangelog = existsSync(new URL("../../../packages/ui/CHANGELOG.md", import.meta.url));
const releases = defineCollection({
	loader: hasChangelog ? glob({ pattern: "CHANGELOG.md", base: "../../packages/ui" }) : () => [],
});

export const collections = { guides, releases };
