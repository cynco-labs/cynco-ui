import { GITHUB } from "./inline-md";
import { readRepo } from "./paths";
import type { RegistryEntry } from "./registry";

export interface ComponentSource {
	/** Just this component's lines, not the file it shares with its neighbours. */
	code: string;
	lines: number;
	/** `packages/ui/src/…tsx:75-126` */
	label: string;
	/** GitHub permalink to the same span. */
	url: string;
}

/** The component's own source, as `scripts/build-registry.mjs` located it. Build-time only. */
export function componentSource(entry: RegistryEntry): ComponentSource | null {
	if (!entry.sourcePath || !entry.sourceStart) return null;
	const file = readRepo(entry.sourcePath);
	if (!file) return null;
	const code = file
		.split("\n")
		.slice(entry.sourceStart - 1, entry.sourceEnd)
		.join("\n")
		.trimEnd();
	return {
		code,
		lines: entry.sourceEnd - entry.sourceStart + 1,
		label: `${entry.sourcePath}:${entry.sourceStart}-${entry.sourceEnd}`,
		url: `${GITHUB}/blob/main/${entry.sourcePath}#L${entry.sourceStart}-L${entry.sourceEnd}`,
	};
}
