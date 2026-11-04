import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { LibraryId, RunKey, TaskId } from "./types.ts";

export const HARNESS_ROOT = fileURLToPath(new URL("..", import.meta.url));
export const REPO_ROOT = resolve(HARNESS_ROOT, "../..");
export const TEMPLATE_DIR = join(HARNESS_ROOT, "template");
const RUNS_ROOT = join(HARNESS_ROOT, "runs");

export const runDir = (runId: string) => join(RUNS_ROOT, runId);
export const runRecordPath = (runId: string) => join(runDir(runId), "run.json");
export const baseDir = (runId: string, library: LibraryId) => join(runDir(runId), "bases", library);
export const cellDir = (key: RunKey) => join(runDir(key.runId), key.task, key.library, String(key.trial));
export const judgePath = (runId: string, task: TaskId, trial: number) =>
	join(runDir(runId), task, `judge-${trial}.json`);

export const cellLabel = (key: RunKey) => `${key.task}/${key.library}/${key.trial}`;

const WORDS = ["northwind", "harbor", "juniper", "meridian", "copper", "orchard", "summit", "tidal", "lumen", "atlas"];

/**
 * A deterministic, project-shaped directory name, so a resumed run finds the same workspace and nothing in
 * the path tells the agent what it is part of.
 */
export function projectName(seed: string, kind = "app"): string {
	const digest = createHash("sha256").update(seed).digest();
	const word = WORDS[digest[0] % WORDS.length];
	const suffix = digest.readUInt32BE(1).toString(36).padStart(4, "0").slice(-4);
	return `${word}-${kind}-${suffix}`;
}

/** Deterministic shuffle seeded by a string, so a judge rerun shows the same label order. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
	const out = [...items];
	let state = createHash("sha256").update(seed).digest().readUInt32BE(0);
	const next = () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 2 ** 32;
	};
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(next() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

/** Writes through a temporary file so an interrupted stage never leaves a half-written record behind. */
export async function writeJson(path: string, value: unknown): Promise<void> {
	await mkdir(dirname(path), { recursive: true });
	const tmp = `${path}.tmp`;
	await writeFile(tmp, `${JSON.stringify(value, null, "\t")}\n`);
	await rename(tmp, path);
}

/** Reads a record this harness wrote itself; a missing file means the stage has not run. */
export async function readRecord<T>(path: string): Promise<T | undefined> {
	try {
		return JSON.parse(await readFile(path, "utf8")) as T;
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") return undefined;
		throw error;
	}
}
