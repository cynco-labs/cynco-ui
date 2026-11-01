import { existsSync } from "node:fs";
import { join } from "node:path";
import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { uiRoot } from "./paths";

export async function guides() {
	return getCollection("guides");
}

/** The changelog body: the package's CHANGELOG.md when Changesets has written one, else the bundled notes. */
export async function changelogEntry(): Promise<CollectionEntry<"guides"> | CollectionEntry<"releases">> {
	const releases = existsSync(join(uiRoot(), "CHANGELOG.md")) ? await getCollection("releases") : [];
	if (releases.length && releases[0].body?.trim()) return releases[0];
	return (await getEntry("guides", "changelog"))!;
}

/** Markdown for the .md endpoint of a guide. */
export function guideMarkdown(title: string, description: string, body: string) {
	const text = body.replace(/^#\s+@cynco-labs\/ui\s*\n/, "").trim();
	return `# ${title}\n\n${description}\n\n${text}\n`;
}
