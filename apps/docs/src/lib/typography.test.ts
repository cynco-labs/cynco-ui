import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { COLOURS, LEGACY, SIZES } from "./typography.ts";

/** The codemod runs on import, so read its table out of the source instead of importing it. */
function codemodMapping(): Record<string, Record<string, string | null>> {
	const path = fileURLToPath(new URL("../../../../scripts/codemods/legacy-type-classes.mjs", import.meta.url));
	const src = readFileSync(path, "utf8");
	const start = src.indexOf("const MAPPING = {");
	const end = src.indexOf("\n};", start);
	assert.ok(start >= 0 && end > start, "legacy-type-classes.mjs no longer declares MAPPING");
	return new Function(`return ${src.slice(src.indexOf("{", start), end + 2)}`)();
}

test("the migration table on the typography page is what the codemod actually does", () => {
	const mapping = codemodMapping();
	assert.deepEqual(
		LEGACY.map((row) => row.cls),
		Object.keys(mapping).map((name) => `text-${name}`),
	);
	for (const row of LEGACY) {
		const from = mapping[row.cls.replace(/^text-/, "")];
		assert.deepEqual(
			[...row.now].sort(),
			[from.size, from.weight, from.extra, from.colour].filter(Boolean).sort(),
			`${row.cls} is documented as rewriting to something the codemod does not produce`,
		);
	}
});

test("every class the page documents is a token utility, never an arbitrary value", () => {
	for (const { cls } of [...SIZES, ...COLOURS]) assert.doesNotMatch(cls, /\[/, `${cls} is an arbitrary value`);
	for (const row of LEGACY) for (const now of row.now) assert.doesNotMatch(now, /\[/, `${now} is an arbitrary value`);
});
