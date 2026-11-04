#!/usr/bin/env node
/**
 * Writes one island per demo to apps/docs/src/islands: <Name>.tsx imports its demo statically, so Astro gives
 * /demo/<slug> (and the home page) a chunk holding only that demo, with no map of every other one. <Name>.astro
 * wraps it with the client directive, because Astro hydrates only components it sees imported by name; pages
 * then choose the wrapper dynamically. Generated output: ignored by git, rebuilt before every docs dev and build.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEMOS = join(ROOT, "apps/docs/src/demos");
const ISLANDS = join(ROOT, "apps/docs/src/islands");

/** A demo's name reaches the generated code as an import path and a component name, so it must be both. */
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

const island = (name) => `import * as mod from "../demos/${name}";
import { DemoFrame } from "../components/DemoFrame";

export default function DemoIsland({ matrix }: { matrix?: string }) {
	return <DemoFrame name="${name}" mod={mod} matrix={matrix} />;
}
`;

/** `visible` hydrates when scrolled into view (the home page); otherwise on load (the demo page). */
const wrapper = (name) => `---
import Island from "./${name}.tsx";
interface Props {
	visible?: boolean;
	matrix?: string;
}
const { visible = false, matrix } = Astro.props;
---

{visible ? <Island client:visible matrix={matrix} /> : <Island client:load matrix={matrix} />}
`;

mkdirSync(ISLANDS, { recursive: true });
const names = [];
const rejected = [];
for (const entry of readdirSync(DEMOS, { withFileTypes: true })) {
	// A directory, a test beside the demo, or a declaration file is not a demo.
	if (!entry.isFile() || !entry.name.endsWith(".tsx") || /\.(test|spec|d)\.tsx$/.test(entry.name)) continue;
	const name = entry.name.slice(0, -4);
	if (IDENTIFIER.test(name)) names.push(name);
	else rejected.push(entry.name);
}
if (rejected.length) {
	console.error(`islands: demo file name is not a valid identifier: ${rejected.join(", ")}`);
	process.exit(1);
}

const files = new Map(
	names.flatMap((n) => [
		[`${n}.tsx`, island(n)],
		[`${n}.astro`, wrapper(n)],
	]),
);
for (const f of readdirSync(ISLANDS)) if (!files.has(f)) rmSync(join(ISLANDS, f), { recursive: true, force: true });
let written = 0;
for (const [file, next] of files) {
	let current = "";
	try {
		current = readFileSync(join(ISLANDS, file), "utf8");
	} catch {}
	if (current !== next) {
		writeFileSync(join(ISLANDS, file), next);
		written++;
	}
}
console.log(`islands: ${names.length} demos, ${written} written`);
