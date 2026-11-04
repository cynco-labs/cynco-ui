import { existsSync } from "node:fs";
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AgentOptions } from "./agent.ts";
import { isRecord, type JsonRecord, num, parseJson, rec, str } from "./json.ts";
import { cellDir, judgePath, projectName, seededShuffle } from "./layout.ts";
import { allLibraryNames } from "./libraries.ts";
import { run } from "./proc.ts";
import { assertNoNames, type Task } from "./tasks.ts";
import { JUDGE_CRITERIA, type JudgeRecord, type JudgeScores, type LibraryId, type RunRecord } from "./types.ts";

const LETTERS = ["A", "B", "C", "D"];

/**
 * Shows one model every library's screenshots for a (task, trial) under shuffled letters, so it rates
 * the screens without knowing which library built them.
 */
export async function judgeTask(
	record: RunRecord,
	task: Task,
	trial: number,
	libraries: readonly LibraryId[],
	options: AgentOptions,
): Promise<JudgeRecord> {
	const order = seededShuffle(libraries, `${record.runId}/${task.id}/${trial}`);
	const labels: Record<string, LibraryId> = {};
	order.forEach((library, i) => {
		labels[LETTERS[i]] = library;
	});

	const dir = join(record.workRoot, projectName(`${record.runId}/${task.id}/${trial}`, "screens"));
	await rm(dir, { recursive: true, force: true });
	await mkdir(dir, { recursive: true });
	const shown: string[] = [];
	for (const [label, library] of Object.entries(labels)) {
		const shots = join(cellDir({ runId: record.runId, task: task.id, library, trial }), "shots");
		const phone = join(shots, "375.png");
		const desktop = join(shots, "1280.png");
		if (!existsSync(phone) || !existsSync(desktop)) continue;
		await copyFile(phone, join(dir, `${label}-phone.png`));
		await copyFile(desktop, join(dir, `${label}-desktop.png`));
		shown.push(label);
	}

	const scores: JudgeRecord["scores"] = {};
	for (const [label, library] of Object.entries(labels)) {
		if (!shown.includes(label)) {
			scores[library] = {
				fulfils: 1,
				hierarchy: 1,
				polish: 1,
				mobile: 1,
				notes: "No screenshots: the build or the page failed.",
				judged: false,
			};
		}
	}
	if (shown.length === 0) {
		await rm(dir, { recursive: true, force: true });
		return { labels, scores, costUsd: null };
	}

	const prompt = judgePrompt(task.prompt, shown);
	assertNoNames(prompt, allLibraryNames(), "judge prompt");
	const [cmd, ...pre] = options.command;
	const result = await run(
		cmd,
		[
			...pre,
			"-p",
			prompt,
			"--model",
			options.model,
			"--setting-sources",
			"project",
			"--strict-mcp-config",
			"--no-session-persistence",
			"--max-budget-usd",
			String(options.budgetUsd),
			"--output-format",
			"json",
			"--json-schema",
			JSON.stringify(schema(shown)),
			"--tools",
			"Read",
		],
		{ cwd: dir, timeoutMs: options.timeoutMin * 60_000 },
	);
	// The copies only exist for this call; the originals stay in each cell's shots folder.
	await rm(dir, { recursive: true, force: true });
	await writeFile(judgePath(record.runId, task.id, trial).replace(/\.json$/, ".raw.json"), result.stdout);

	const output = parseJson(result.stdout);
	if (!isRecord(output)) throw new Error(`Judge returned no JSON (exit ${result.code}): ${result.stderr.slice(-500)}`);
	const structured = rec(output, "structured_output") ?? asRecord(parseJson(str(output, "result") ?? ""));
	if (!structured) throw new Error(`Judge output has no structured scores: ${result.stdout.slice(0, 500)}`);
	for (const label of shown) {
		const parsed = parseScores(rec(structured, label));
		if (!parsed) throw new Error(`Judge gave no valid scores for ${label}: ${JSON.stringify(structured[label])}`);
		scores[labels[label]] = { ...parsed, judged: true };
	}
	return { labels, scores, costUsd: num(output, "total_cost_usd") ?? null };
}

function judgePrompt(request: string, labels: readonly string[]): string {
	return `Someone gave a developer the request below. You are looking at ${labels.length} separate implementations of it, labelled ${labels.join(", ")}. For each label there are two full-page screenshots in the current directory: <label>-phone.png (375px wide) and <label>-desktop.png (1280px wide). Read every screenshot before you answer.

Request:
"""
${request}
"""

Rate each implementation from 1 (poor) to 10 (excellent) on:
- fulfils: how completely the visible screen does what the request asks. Missing features cost points; a blank or broken page is 1.
- hierarchy: whether the important things stand out and the layout reads in a clear order.
- polish: consistent spacing, alignment, type and colour, with nothing clipped, overlapping or unstyled.
- mobile: whether the phone layout works on its own terms: no sideways scrolling, nothing cut off, controls big enough to tap.

Rate each one against the request on its own merits and use the full range. Base every rating on what the screenshots show; behaviour you cannot see should neither raise nor lower it. In notes, give one or two sentences on the main strengths and problems.`;
}

function schema(labels: readonly string[]): JsonRecord {
	const rating = { type: "integer", minimum: 1, maximum: 10 };
	const item = {
		type: "object",
		properties: { ...Object.fromEntries(JUDGE_CRITERIA.map((c) => [c, rating])), notes: { type: "string" } },
		required: [...JUDGE_CRITERIA, "notes"],
		additionalProperties: false,
	};
	return {
		type: "object",
		properties: Object.fromEntries(labels.map((label) => [label, item])),
		required: [...labels],
		additionalProperties: false,
	};
}

function parseScores(value: JsonRecord | undefined): JudgeScores | null {
	if (!value) return null;
	const rating = (key: string) => {
		const n = num(value, key);
		return n !== undefined && Number.isInteger(n) && n >= 1 && n <= 10 ? n : null;
	};
	const fulfils = rating("fulfils");
	const hierarchy = rating("hierarchy");
	const polish = rating("polish");
	const mobile = rating("mobile");
	if (fulfils === null || hierarchy === null || polish === null || mobile === null) return null;
	return { fulfils, hierarchy, polish, mobile, notes: str(value, "notes") ?? "" };
}

const asRecord = (value: unknown): JsonRecord | undefined => (isRecord(value) ? value : undefined);
