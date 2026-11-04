import { existsSync } from "node:fs";
import { copyFile, cp, mkdir, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { type AgentOptions, agentCommand, agentVersion, runAgent } from "./agent.ts";
import { judgeTask } from "./judge.ts";
import { cellDir, cellLabel, judgePath, readRecord, runDir, runRecordPath, writeJson } from "./layout.ts";
import { allLibraryNames, LIBRARIES } from "./libraries.ts";
import { pool, stopProcessesIn } from "./proc.ts";
import { writeReport } from "./report.ts";
import { ensureBases, ensureWorkspace } from "./scaffold.ts";
import { scoreWorkspace } from "./score.ts";
import { assertBlind, TASKS } from "./tasks.ts";
import {
	type BaseRecord,
	LIBRARY_IDS,
	type LibraryId,
	type RunKey,
	type RunRecord,
	TASK_IDS,
	type TaskId,
	type WorkspaceRecord,
} from "./types.ts";

const STAGES = ["scaffold", "agent", "score", "build", "judge", "report", "all", "clean"] as const;
type Stage = (typeof STAGES)[number];

const USAGE = `node evals/agent-tasks/src/cli.ts <${STAGES.join("|")}> --run <id>
  [--libs ${LIBRARY_IDS.join(",")}] [--tasks ${TASK_IDS.join(",")}] [--trials 1]
  [--model sonnet] [--judge-model opus] [--budget 5] [--timeout-min 25] [--concurrency 2]
  [--cynco local|npm] [--work-root <dir>] [--force] [--keep-workspaces]`;

interface Options {
	stage: Stage;
	runId: string;
	libraries: LibraryId[];
	tasks: TaskId[];
	trials: number;
	model: string;
	judgeModel: string;
	budgetUsd: number;
	timeoutMin: number;
	concurrency: number;
	cynco: "local" | "npm";
	workRoot: string;
	force: boolean;
	keepWorkspaces: boolean;
}

function parseOptions(argv: string[]): Options {
	const { values, positionals } = parseArgs({
		args: argv,
		allowPositionals: true,
		options: {
			run: { type: "string" },
			libs: { type: "string" },
			tasks: { type: "string" },
			trials: { type: "string", default: "1" },
			model: { type: "string", default: "sonnet" },
			"judge-model": { type: "string", default: "opus" },
			budget: { type: "string", default: "5" },
			"timeout-min": { type: "string", default: "25" },
			concurrency: { type: "string", default: "2" },
			cynco: { type: "string", default: "local" },
			"work-root": { type: "string", default: join(tmpdir(), "projects") },
			force: { type: "boolean", default: false },
			"keep-workspaces": { type: "boolean", default: false },
		},
	});
	const stage = STAGES.find((s) => s === positionals[0]);
	if (!stage || !values.run) throw new Error(USAGE);
	if (!/^[\w.-]+$/.test(values.run)) throw new Error("--run may only contain letters, digits, '.', '_' and '-'.");
	const cynco = values.cynco;
	if (cynco !== "local" && cynco !== "npm") throw new Error("--cynco must be local or npm.");
	return {
		stage,
		runId: values.run,
		libraries: pickList(values.libs, LIBRARY_IDS, "--libs"),
		tasks: pickList(values.tasks, TASK_IDS, "--tasks"),
		trials: positiveNumber(values.trials, "--trials"),
		model: values.model,
		judgeModel: values["judge-model"],
		budgetUsd: positiveNumber(values.budget, "--budget"),
		timeoutMin: positiveNumber(values["timeout-min"], "--timeout-min"),
		concurrency: positiveNumber(values.concurrency, "--concurrency"),
		cynco,
		workRoot: resolve(values["work-root"]),
		force: values.force,
		keepWorkspaces: values["keep-workspaces"],
	};
}

function pickList<T extends string>(raw: string | undefined, all: readonly T[], flag: string): T[] {
	if (!raw) return [...all];
	return raw.split(",").map((item) => {
		const found = all.find((candidate) => candidate === item.trim());
		if (!found) throw new Error(`${flag}: unknown "${item}". Choose from ${all.join(", ")}.`);
		return found;
	});
}

function positiveNumber(raw: string, flag: string): number {
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0) throw new Error(`${flag} must be a positive number, got "${raw}".`);
	return n;
}

const cellsOf = (o: Options): RunKey[] =>
	o.tasks.flatMap((task) =>
		o.libraries.flatMap((library) =>
			Array.from({ length: o.trials }, (_, i) => ({ runId: o.runId, task, library, trial: i + 1 })),
		),
	);

async function loadRun(o: Options): Promise<RunRecord> {
	const existing = await readRecord<RunRecord>(runRecordPath(o.runId));
	if (existing) {
		if (existing.cynco !== o.cynco || existing.workRoot !== o.workRoot) {
			console.log(`[run] keeping this run's --cynco ${existing.cynco} and --work-root ${existing.workRoot}`);
		}
		return existing;
	}
	const record: RunRecord = {
		runId: o.runId,
		created: new Date().toISOString(),
		workRoot: o.workRoot,
		cynco: o.cynco,
	};
	await mkdir(o.workRoot, { recursive: true });
	await writeJson(runRecordPath(o.runId), record);
	return record;
}

async function updateRun(record: RunRecord, patch: Partial<RunRecord>): Promise<RunRecord> {
	const next = { ...record, ...patch };
	await writeJson(runRecordPath(record.runId), next);
	return next;
}

type Bases = Partial<Record<LibraryId, BaseRecord>>;

async function scaffold(o: Options, record: RunRecord): Promise<number> {
	await ensureBases(record, o.libraries, o.force);
	return 0;
}

function agentOptions(o: Options, model: string): AgentOptions {
	return { command: agentCommand(), model, budgetUsd: o.budgetUsd, timeoutMin: o.timeoutMin };
}

async function recordAgent(record: RunRecord, o: Options, options: AgentOptions): Promise<void> {
	await updateRun(record, {
		agentCmd: options.command.join(" "),
		cliVersion: await agentVersion(options.command),
		model: o.model,
		budgetUsd: o.budgetUsd,
	});
}

async function agentCell(
	key: RunKey,
	o: Options,
	record: RunRecord,
	bases: Bases,
	options: AgentOptions,
): Promise<void> {
	const out = join(cellDir(key), "agent.json");
	if (existsSync(out) && !o.force) return;
	// No agent.json means the agent never ran here or was cut off; either way it starts from a clean copy.
	const workspace = await ensureWorkspace(key, record, bases, true);
	await rm(join(cellDir(key), "score.json"), { force: true });
	await rm(join(cellDir(key), "shots"), { recursive: true, force: true });
	await rm(join(cellDir(key), "src"), { recursive: true, force: true });
	await rm(judgePath(key.runId, key.task, key.trial), { force: true });
	const task = TASKS.find((t) => t.id === key.task);
	if (!task) throw new Error(`Unknown task ${key.task}`);
	console.log(`[agent] ${cellLabel(key)} started`);
	const metrics = await runAgent(key, task.prompt, workspace, LIBRARIES[key.library], options);
	await stopProcessesIn(workspace);
	await writeJson(out, metrics);
	console.log(`[agent] ${cellLabel(key)} done: $${metrics.costUsd?.toFixed(2) ?? "?"}, ${metrics.turns} turns`);
}

async function scoreCell(key: RunKey, o: Options, bases: Bases): Promise<void> {
	const out = join(cellDir(key), "score.json");
	if (existsSync(out) && !o.force) return;
	const workspace = (await readRecord<WorkspaceRecord>(join(cellDir(key), "workspace.json")))?.path;
	if (!workspace || !existsSync(workspace)) {
		throw new Error(`[score] ${cellLabel(key)}: no workspace to score; run the agent stage (with --force) first.`);
	}
	const shots = join(cellDir(key), "shots");
	await rm(shots, { recursive: true, force: true });
	await mkdir(shots, { recursive: true });
	const result = await scoreWorkspace(workspace, shots, LIBRARIES[key.library], bases[key.library]?.path ?? null);
	await writeJson(out, result);
	console.log(`[score] ${cellLabel(key)}: build ${result.build.ok ? "ok" : "failed"}`);
	if (!o.keepWorkspaces) await archiveWorkspace(cellDir(key), workspace);
}

/** Keeps what the agent wrote next to its scores and deletes the app, whose node_modules and build fill a disk fast. */
async function archiveWorkspace(dir: string, workspace: string): Promise<void> {
	await stopProcessesIn(workspace);
	// A deletion that was cut off leaves the app without src; the copy taken before it stays.
	if (existsSync(join(workspace, "src"))) {
		await rm(join(dir, "src"), { recursive: true, force: true });
		await cp(join(workspace, "src"), join(dir, "src"), { recursive: true });
	}
	if (existsSync(join(workspace, "package.json"))) {
		await copyFile(join(workspace, "package.json"), join(dir, "package.json"));
	}
	await rm(workspace, { recursive: true, force: true });
}

async function agent(o: Options, record: RunRecord): Promise<number> {
	const bases = await ensureBases(record, o.libraries, false);
	const options = agentOptions(o, o.model);
	await recordAgent(record, o, options);
	return pool(cellsOf(o), o.concurrency, (key) => agentCell(key, o, record, bases, options));
}

async function score(o: Options, record: RunRecord): Promise<number> {
	const bases = await ensureBases(record, o.libraries, false);
	return pool(cellsOf(o), o.concurrency, (key) => scoreCell(key, o, bases));
}

/** Scores each cell as soon as its agent finishes, so only `--concurrency` apps exist on disk at once. */
async function build(o: Options, record: RunRecord): Promise<number> {
	const bases = await ensureBases(record, o.libraries, o.force);
	const options = agentOptions(o, o.model);
	await recordAgent(record, o, options);
	return pool(cellsOf(o), o.concurrency, async (key) => {
		await agentCell(key, o, record, bases, options);
		await scoreCell(key, o, bases);
	});
}

/**
 * Deletes a run's apps and bases. A cell whose agent finished keeps its source first; one that was never scored
 * cannot be scored afterwards, so the agent stage reruns it.
 */
async function clean(o: Options): Promise<number> {
	// Walks what is on disk rather than the flags, so it finds every trial and task the run ever made.
	const records = (await readdir(runDir(o.runId), { recursive: true })).filter(
		(path) => basename(path) === "workspace.json" || basename(path) === "base.json",
	);
	for (const record of records) {
		const dir = join(runDir(o.runId), dirname(record));
		const app = (await readRecord<{ path: string }>(join(dir, basename(record))))?.path;
		if (!app || !existsSync(app)) continue;
		if (basename(record) === "workspace.json" && existsSync(join(dir, "agent.json"))) {
			await archiveWorkspace(dir, app);
			if (!existsSync(join(dir, "score.json"))) await rm(join(dir, "agent.json"), { force: true });
		} else {
			await stopProcessesIn(app);
			await rm(app, { recursive: true, force: true });
		}
	}
	console.log(`[clean] removed the apps and bases of ${o.runId}`);
	return 0;
}

async function judge(o: Options, record: RunRecord): Promise<number> {
	const options = agentOptions(o, o.judgeModel);
	await updateRun(record, { judgeModel: o.judgeModel });
	const pairs = o.tasks.flatMap((task) => Array.from({ length: o.trials }, (_, i) => ({ task, trial: i + 1 })));
	return pool(pairs, o.concurrency, async ({ task, trial }) => {
		const out = judgePath(o.runId, task, trial);
		if (existsSync(out) && !o.force) return;
		const unscored = o.libraries.filter(
			(library) => !existsSync(join(cellDir({ runId: o.runId, task, library, trial }), "score.json")),
		);
		if (unscored.length > 0) throw new Error(`[judge] ${task}/${trial}: score ${unscored.join(", ")} first.`);
		const taskDef = TASKS.find((t) => t.id === task);
		if (!taskDef) throw new Error(`Unknown task ${task}`);
		const result = await judgeTask(record, taskDef, trial, o.libraries, options);
		await writeJson(out, result);
		console.log(`[judge] ${task}/${trial} done`);
	});
}

async function main(): Promise<void> {
	const o = parseOptions(process.argv.slice(2));
	for (const task of TASKS) assertBlind(task.prompt, allLibraryNames(), `prompt for ${task.id}`);
	let record = await loadRun(o);
	const stages: Stage[] = o.stage === "all" ? ["build", "judge", "report"] : [o.stage];
	let failures = 0;
	for (const stage of stages) {
		if (stage === "scaffold") failures += await scaffold(o, record);
		if (stage === "build") failures += await build(o, record);
		if (stage === "clean") failures += await clean(o);
		if (stage === "agent") failures += await agent(o, record);
		if (stage === "score") failures += await score(o, record);
		if (stage === "judge") failures += await judge(o, record);
		if (stage === "report") console.log(`[report] ${await writeReport(o.runId, o.libraries, o.tasks, o.trials)}`);
		record = (await readRecord<RunRecord>(runRecordPath(o.runId))) ?? record;
	}
	if (failures > 0) {
		console.error(`${failures} item(s) failed; rerun the same command to retry them.`);
		process.exitCode = 1;
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
