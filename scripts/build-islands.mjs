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

const island = (name) => `import * as mod from "../demos/${name}";
import { DemoFrame } from "../components/DemoFrame";

export default function ${name}Island() {
	return <DemoFrame name="${name}" mod={mod} />;
}
`;

/** `visible` hydrates when scrolled into view (the home page); otherwise on load (the demo page). */
const wrapper = (name) => `---
import Island from "./${name}.tsx";
const { visible = false } = Astro.props;
---

{visible ? <Island client:visible /> : <Island client:load />}
`;

mkdirSync(ISLANDS, { recursive: true });
const names = readdirSync(DEMOS).filter((f) => f.endsWith(".tsx")).map((f) => f.slice(0, -4));
const files = new Map(names.flatMap((n) => [[`${n}.tsx`, island(n)], [`${n}.astro`, wrapper(n)]]));
for (const f of readdirSync(ISLANDS)) if (!files.has(f)) rmSync(join(ISLANDS, f));
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
