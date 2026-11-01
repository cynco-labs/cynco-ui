import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

const require = createRequire(import.meta.url);

/** Absolute path of the @cynco-labs/ui package (the workspace package). Build-time only. */
export function uiRoot(): string {
	try {
		return dirname(require.resolve("@cynco-labs/ui/package.json"));
	} catch {
		return join(process.cwd(), "../../packages/ui");
	}
}

export function readUi(path: string): string | null {
	const p = join(uiRoot(), path);
	return existsSync(p) ? readFileSync(p, "utf8") : null;
}
