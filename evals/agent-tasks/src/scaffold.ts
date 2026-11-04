import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
	baseDir,
	cellDir,
	cellLabel,
	projectName,
	REPO_ROOT,
	readRecord,
	runDir,
	TEMPLATE_DIR,
	writeJson,
} from "./layout.ts";
import { LIBRARIES, type Library, otherLibraryNames, type Step } from "./libraries.ts";
import { runOrThrow } from "./proc.ts";
import { scoreWorkspace } from "./score.ts";
import { assertBlind } from "./tasks.ts";
import type { BaseRecord, LibraryId, RunKey, RunRecord, WorkspaceRecord } from "./types.ts";

const STEP_TIMEOUT_MS = 10 * 60_000;
const SHARED_PACKAGES = ["react", "vite", "tailwindcss", "typescript"];

/** Builds (or reuses) one verified base app per library, one at a time, before any cell work runs in parallel. */
export async function ensureBases(
	run: RunRecord,
	libraries: readonly LibraryId[],
	force: boolean,
): Promise<Partial<Record<LibraryId, BaseRecord>>> {
	const bases: Partial<Record<LibraryId, BaseRecord>> = {};
	let tarball: string | null = null;
	for (const id of libraries) {
		const recordPath = join(baseDir(run.runId, id), "base.json");
		const existing = await readRecord<BaseRecord>(recordPath);
		if (existing && existsSync(existing.path) && !force) {
			bases[id] = existing;
			continue;
		}
		if (id === "cynco" && run.cynco === "local") tarball ??= await packLocalCynco(run.runId);
		bases[id] = await buildBase(run, LIBRARIES[id], tarball);
		await writeJson(recordPath, bases[id]);
	}
	return bases;
}

async function packLocalCynco(runId: string): Promise<string> {
	const packDir = join(runDir(runId), "pack");
	await rm(packDir, { recursive: true, force: true });
	await mkdir(packDir, { recursive: true });
	console.log("[scaffold] building and packing the local @cynco-labs/ui");
	await runOrThrow("pnpm", ["--filter", "@cynco-labs/ui", "build"], { cwd: REPO_ROOT, timeoutMs: STEP_TIMEOUT_MS });
	await runOrThrow("pnpm", ["pack", "--pack-destination", packDir], {
		cwd: join(REPO_ROOT, "packages/ui"),
		timeoutMs: STEP_TIMEOUT_MS,
	});
	const tgz = (await readdir(packDir)).find((name) => name.endsWith(".tgz"));
	if (!tgz) throw new Error(`pnpm pack wrote no tarball to ${packDir}`);
	return join(packDir, tgz);
}

async function buildBase(run: RunRecord, library: Library, tarball: string | null): Promise<BaseRecord> {
	const claudeMd = `${library.claudeMd}\n`;
	assertBlind(claudeMd, otherLibraryNames(library.id), `CLAUDE.md for ${library.id}`);
	const path = join(run.workRoot, projectName(`${run.runId}/base/${library.id}`));
	console.log(`[scaffold] base for ${library.id} at ${path}`);
	await rm(path, { recursive: true, force: true });
	await cp(TEMPLATE_DIR, path, { recursive: true, filter: (src) => !/[/\\](node_modules|dist)([/\\]|$)/.test(src) });
	await renamePackage(path, projectName(`${run.runId}/base/${library.id}`));

	const steps: Step[] = [
		{ kind: "run", cmd: "npm", args: ["install", "--no-audit", "--no-fund"] },
		...library.setup({ cyncoTarball: tarball }),
		{ kind: "write", path: "CLAUDE.md", content: claudeMd },
	];
	for (const step of steps) await applyStep(path, step);

	const probe = await verifyBase(run, library, path);
	return {
		library: library.id,
		path,
		versions: await installedVersions(path, [...library.packages, ...SHARED_PACKAGES]),
		skills: await skillHashes(path),
		steps: steps.map(describeStep),
		probe,
	};
}

/** Proves the base renders one library component before any agent budget is spent on it. */
async function verifyBase(run: RunRecord, library: Library, base: string): Promise<BaseRecord["probe"]> {
	const probeDir = join(run.workRoot, projectName(`${run.runId}/probe/${library.id}`));
	await clone(base, probeDir);
	for (const step of library.probe.steps) await applyStep(probeDir, step);
	await writeFile(join(probeDir, "src/App.tsx"), library.probe.app);
	const shots = join(baseDir(run.runId, library.id), "probe-shots");
	await mkdir(shots, { recursive: true });
	const score = await scoreWorkspace(probeDir, shots, library, base);
	if (!score.build.ok || !score.browser?.rendered) {
		throw new Error(`The ${library.id} base does not build and render a component:\n${JSON.stringify(score, null, 2)}`);
	}
	await rm(probeDir, { recursive: true, force: true });
	return score;
}

/** Returns the cell's workspace, cloning the base when it is missing or when `reset` asks for a clean copy. */
export async function ensureWorkspace(
	key: RunKey,
	run: RunRecord,
	bases: Partial<Record<LibraryId, BaseRecord>>,
	reset: boolean,
): Promise<string> {
	const base = bases[key.library];
	if (!base) throw new Error(`No base for ${key.library}; scaffold it first.`);
	const recordPath = join(cellDir(key), "workspace.json");
	const existing = await readRecord<WorkspaceRecord>(recordPath);
	if (existing && existsSync(existing.path) && !reset) return existing.path;
	const path = join(run.workRoot, projectName(`${key.runId}/${key.task}/${key.library}/${key.trial}`));
	console.log(`[scaffold] ${cellLabel(key)} -> ${path}`);
	await clone(base.path, path);
	await writeJson(recordPath, { path, base: base.path } satisfies WorkspaceRecord);
	return path;
}

async function clone(from: string, to: string): Promise<void> {
	await rm(to, { recursive: true, force: true });
	await mkdir(dirname(to), { recursive: true });
	// -c makes APFS copy-on-write clones, so a full node_modules costs almost nothing per workspace.
	const flags = process.platform === "darwin" ? "-cR" : "-R";
	await runOrThrow("cp", [flags, from, to], { cwd: dirname(to) });
}

async function applyStep(dir: string, step: Step): Promise<void> {
	console.log(`  ${describeStep(step)}`);
	switch (step.kind) {
		case "run":
			await runOrThrow(step.cmd, step.args, { cwd: dir, timeoutMs: STEP_TIMEOUT_MS });
			return;
		case "write":
			await mkdir(dirname(join(dir, step.path)), { recursive: true });
			await writeFile(join(dir, step.path), step.content);
			return;
		case "copy":
			await mkdir(dirname(join(dir, step.to)), { recursive: true });
			await copyFile(step.from, join(dir, step.to));
			return;
		case "edit": {
			const text = await readFile(join(dir, step.path), "utf8");
			if (!text.includes(step.find)) {
				throw new Error(`${step.path} no longer contains ${JSON.stringify(step.find)}; the library's setup changed.`);
			}
			await writeFile(join(dir, step.path), text.replace(step.find, step.replace));
			return;
		}
	}
}

function describeStep(step: Step): string {
	switch (step.kind) {
		case "run":
			return [step.cmd, ...step.args].join(" ");
		case "write":
			return `write ${step.path}`;
		case "copy":
			return `copy ${step.to}`;
		case "edit":
			return `edit ${step.path}: ${JSON.stringify(step.find)} -> ${JSON.stringify(step.replace)}`;
	}
}

async function renamePackage(dir: string, name: string): Promise<void> {
	const path = join(dir, "package.json");
	const text = await readFile(path, "utf8");
	await writeFile(path, text.replace(/"name": "[^"]*"/, `"name": "${name}"`));
}

async function installedVersions(dir: string, packages: readonly string[]): Promise<Record<string, string>> {
	const versions: Record<string, string> = {};
	for (const name of packages) {
		try {
			const manifest: unknown = JSON.parse(await readFile(join(dir, "node_modules", name, "package.json"), "utf8"));
			if (typeof manifest === "object" && manifest !== null && "version" in manifest) {
				versions[name] = String(manifest.version);
			}
		} catch {
			versions[name] = "missing";
		}
	}
	return versions;
}

async function skillHashes(dir: string): Promise<Record<string, string>> {
	const skillsDir = join(dir, ".claude/skills");
	if (!existsSync(skillsDir)) return {};
	const hashes: Record<string, string> = {};
	for (const name of await readdir(skillsDir)) {
		const skill = join(skillsDir, name, "SKILL.md");
		if (existsSync(skill)) {
			hashes[name] = createHash("sha256")
				.update(await readFile(skill))
				.digest("hex")
				.slice(0, 12);
		}
	}
	return hashes;
}
