import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { baseDir, cellDir, judgePath, readRecord, runDir } from "./layout.ts";
import { LIBRARIES } from "./libraries.ts";
import { TASKS } from "./tasks.ts";
import {
	type AgentMetrics,
	type BaseRecord,
	JUDGE_CRITERIA,
	type JudgeRecord,
	type JudgeScores,
	type LibraryId,
	type RunKey,
	type RunRecord,
	type ScoreRecord,
	type TaskId,
	type TaskSet,
	VIEWPORTS,
} from "./types.ts";

interface Cell {
	key: RunKey;
	set: TaskSet;
	agent: AgentMetrics | null;
	score: ScoreRecord | null;
	judge: (JudgeScores & { judged: boolean }) | null;
}

interface Stat {
	n: number;
	mean: number;
	median: number;
	min: number;
	max: number;
}

type Metric = { label: string; value: (cell: Cell) => number | null; digits: number };

const judgeOverall = (j: JudgeScores) => JUDGE_CRITERIA.reduce((sum, c) => sum + j[c], 0) / JUDGE_CRITERIA.length;

const PASS_RATES: { label: string; pass: (score: ScoreRecord) => boolean }[] = [
	{ label: "builds", pass: (s) => s.build.ok },
	{ label: "0 type errors", pass: (s) => s.build.typeErrors === 0 },
	{ label: "renders", pass: (s) => s.browser?.rendered === true },
	{ label: "no overflow 320-1280", pass: (s) => s.browser !== null && VIEWPORTS.every((w) => !s.browser?.overflow[w]) },
	{
		label: "0 serious/critical axe",
		pass: (s) => s.browser !== null && s.browser.axe.serious + s.browser.axe.critical === 0,
	},
	{ label: "0 console errors", pass: (s) => s.browser?.consoleErrors === 0 },
];

const METRICS: Metric[] = [
	{ label: "judge overall", value: (c) => (c.judge ? judgeOverall(c.judge) : null), digits: 1 },
	...JUDGE_CRITERIA.map((criterion) => ({
		label: `judge ${criterion}`,
		value: (c: Cell) => c.judge?.[criterion] ?? null,
		digits: 1,
	})),
	{ label: "cost (USD)", value: (c) => c.agent?.costUsd ?? null, digits: 2 },
	{
		label: "judge overall per $",
		value: (c) => (c.judge && c.agent?.costUsd ? judgeOverall(c.judge) / c.agent.costUsd : null),
		digits: 1,
	},
	{ label: "turns", value: (c) => c.agent?.turns ?? null, digits: 0 },
	{ label: "minutes", value: (c) => (c.agent ? c.agent.durationMs / 60_000 : null), digits: 1 },
	{ label: "input tokens (k)", value: (c) => (c.agent ? c.agent.inputTokens / 1000 : null), digits: 0 },
	{ label: "output tokens (k)", value: (c) => (c.agent ? c.agent.outputTokens / 1000 : null), digits: 1 },
	{ label: "doc lookups", value: (c) => c.agent?.docLookups ?? null, digits: 0 },
	{ label: "type errors", value: (c) => c.score?.build.typeErrors ?? null, digits: 0 },
	{
		label: "axe serious+critical",
		value: (c) => (c.score?.browser ? c.score.browser.axe.serious + c.score.browser.axe.critical : null),
		digits: 0,
	},
	{
		label: "focus visible %",
		value: (c) => {
			const focus = c.score?.browser?.focusVisible;
			return focus && focus.checked > 0 ? (100 * focus.visible) / focus.checked : null;
		},
		digits: 0,
	},
	{ label: "library imports", value: (c) => c.score?.source.libraryImports ?? null, digits: 0 },
	{ label: "raw interactive", value: (c) => c.score?.source.rawInteractive ?? null, digits: 0 },
	{ label: "off-system styles", value: (c) => c.score?.source.offSystemStyles ?? null, digits: 0 },
	{ label: "lines written", value: (c) => c.score?.source.lines ?? null, digits: 0 },
];

export async function writeReport(
	runId: string,
	libraries: readonly LibraryId[],
	tasks: readonly TaskId[],
	trials: number,
): Promise<string> {
	const record = await readRecord<RunRecord>(join(runDir(runId), "run.json"));
	if (!record) throw new Error(`No run.json for ${runId}; run scaffold first.`);
	const cells: Cell[] = [];
	for (const task of TASKS.filter((t) => tasks.includes(t.id))) {
		for (let trial = 1; trial <= trials; trial++) {
			const judge = await readRecord<JudgeRecord>(judgePath(runId, task.id, trial));
			for (const library of libraries) {
				const key: RunKey = { runId, task: task.id, library, trial };
				cells.push({
					key,
					set: task.set,
					agent: (await readRecord<AgentMetrics>(join(cellDir(key), "agent.json"))) ?? null,
					score: (await readRecord<ScoreRecord>(join(cellDir(key), "score.json"))) ?? null,
					judge: judge?.scores[library] ?? null,
				});
			}
		}
	}
	const bases: Partial<Record<LibraryId, BaseRecord>> = {};
	for (const library of libraries)
		bases[library] = await readRecord<BaseRecord>(join(baseDir(runId, library), "base.json"));

	const sets: TaskSet[] = ["generic", "domain"];
	const summary = Object.fromEntries(
		sets.map((set) => [
			set,
			Object.fromEntries(
				libraries.map((library) => [library, summarise(cells.filter((c) => c.set === set && c.key.library === library))]),
			),
		]),
	);
	await writeFile(
		join(runDir(runId), "results.json"),
		`${JSON.stringify({ run: record, bases, summary, cells }, null, "\t")}\n`,
	);
	const markdown = renderMarkdown(record, bases, cells, libraries, tasks, trials);
	const path = join(runDir(runId), "report.md");
	await writeFile(path, markdown);
	return path;
}

function summarise(cells: Cell[]) {
	const scored = cells.flatMap((c) => (c.score ? [c.score] : []));
	return {
		cells: cells.length,
		scored: scored.length,
		passRates: Object.fromEntries(
			PASS_RATES.map((rate) => [rate.label, scored.length ? scored.filter(rate.pass).length / scored.length : null]),
		),
		metrics: Object.fromEntries(METRICS.map((metric) => [metric.label, stat(cells.map(metric.value))])),
	};
}

function stat(values: (number | null)[]): Stat | null {
	const xs = values.filter((v): v is number => v !== null).sort((a, b) => a - b);
	if (xs.length === 0) return null;
	const mid = Math.floor(xs.length / 2);
	return {
		n: xs.length,
		mean: xs.reduce((sum, x) => sum + x, 0) / xs.length,
		median: xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2,
		min: xs[0],
		max: xs[xs.length - 1],
	};
}

function renderMarkdown(
	record: RunRecord,
	bases: Partial<Record<LibraryId, BaseRecord>>,
	cells: Cell[],
	libraries: readonly LibraryId[],
	tasks: readonly TaskId[],
	trials: number,
): string {
	const out: string[] = [];
	const labels = libraries.map((id) => LIBRARIES[id].label);
	out.push(`# UI library agent run ${record.runId}`, "");
	out.push(`- Generated: ${new Date().toISOString()} (run created ${record.created})`);
	out.push(
		`- Agent: \`${record.agentCmd ?? "not run"}\`, CLI ${record.cliVersion ?? "unknown"}, model ${record.model ?? "unknown"}, budget $${record.budgetUsd ?? "?"} per task`,
	);
	out.push(`- Judge model: ${record.judgeModel ?? "not run"}`);
	out.push(`- Trials: ${trials} per task and library; tasks: ${tasks.join(", ")}`);
	out.push(`- Cynco UI source: ${record.cynco}`);
	for (const library of libraries) {
		const base = bases[library];
		const versions = base
			? Object.entries(base.versions)
					.map(([name, v]) => `${name}@${v}`)
					.join(", ")
			: "no base";
		const skills =
			base && Object.keys(base.skills).length
				? `; skills ${Object.entries(base.skills)
						.map(([n, h]) => `${n} (${h})`)
						.join(", ")}`
				: "";
		out.push(`- ${LIBRARIES[library].label}: ${versions}${skills}`);
	}
	out.push(
		"",
		`With ${trials} trial(s) per cell, n per library is small. Read the spread [min, max], not just the centre.`,
		"",
	);

	for (const set of ["generic", "domain"] as const) {
		const setCells = cells.filter((c) => c.set === set);
		if (setCells.length === 0) continue;
		out.push(`## ${set === "generic" ? "Generic tasks" : "Accounting tasks"}`, "");
		out.push(`| Pass rate | ${labels.join(" | ")} |`, `| --- |${libraries.map(() => " --- |").join("")}`);
		for (const rate of PASS_RATES) {
			const row = libraries.map((library) => {
				const scored = setCells.flatMap((c) => (c.key.library === library && c.score ? [c.score] : []));
				return scored.length ? `${scored.filter(rate.pass).length}/${scored.length}` : "-";
			});
			out.push(`| ${rate.label} | ${row.join(" | ")} |`);
		}
		out.push(
			"",
			`| Metric: mean / median [min, max] | ${labels.join(" | ")} |`,
			`| --- |${libraries.map(() => " --- |").join("")}`,
		);
		for (const metric of METRICS) {
			const row = libraries.map((library) =>
				formatStat(stat(setCells.filter((c) => c.key.library === library).map(metric.value)), metric.digits),
			);
			out.push(`| ${metric.label} | ${row.join(" | ")} |`);
		}
		out.push("");
	}

	out.push("## Per task", "", "Each cell: builds k/n, mean judge overall, mean cost.", "");
	out.push(`| Task | ${labels.join(" | ")} |`, `| --- |${libraries.map(() => " --- |").join("")}`);
	for (const task of tasks) {
		const row = libraries.map((library) => {
			const mine = cells.filter((c) => c.key.task === task && c.key.library === library);
			const built = mine.filter((c) => c.score?.build.ok).length;
			const judge = stat(mine.map((c) => (c.judge ? judgeOverall(c.judge) : null)));
			const cost = stat(mine.map((c) => c.agent?.costUsd ?? null));
			return `${built}/${mine.length} · ${judge ? judge.mean.toFixed(1) : "-"} · ${cost ? `$${cost.mean.toFixed(2)}` : "-"}`;
		});
		out.push(`| ${task} | ${row.join(" | ")} |`);
	}

	const notes = cells.filter((c) => c.judge?.notes);
	if (notes.length) {
		out.push("", "## Judge notes", "");
		for (const c of notes)
			out.push(`- ${c.key.task} #${c.key.trial}, ${LIBRARIES[c.key.library].label}: ${c.judge?.notes}`);
	}
	return `${out.join("\n")}\n`;
}

function formatStat(s: Stat | null, digits: number): string {
	if (!s) return "-";
	const f = (x: number) => x.toFixed(digits);
	return `${f(s.mean)} / ${f(s.median)} [${f(s.min)}, ${f(s.max)}]`;
}
