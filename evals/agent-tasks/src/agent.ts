import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { isRecord, type JsonRecord, num, parseJson, rec, str } from "./json.ts";
import { cellDir } from "./layout.ts";
import type { Library } from "./libraries.ts";
import { run } from "./proc.ts";
import type { AgentMetrics, RunKey } from "./types.ts";

export interface AgentOptions {
	/** The agent command split on spaces, e.g. `claude` or `acc launch claude --`. */
	command: string[];
	model: string;
	budgetUsd: number;
	timeoutMin: number;
}

export function agentCommand(): string[] {
	return (process.env.AGENT_CMD ?? "claude").split(" ").filter(Boolean);
}

export async function agentVersion(command: string[]): Promise<string> {
	const [cmd, ...pre] = command;
	const result = await run(cmd, [...pre, "--version"], { cwd: process.cwd(), timeoutMs: 60_000 });
	return result.stdout.trim() || result.stderr.trim();
}

export async function runAgent(
	key: RunKey,
	prompt: string,
	workspace: string,
	library: Library,
	options: AgentOptions,
): Promise<AgentMetrics> {
	const dir = cellDir(key);
	const streamPath = join(dir, "agent.jsonl");
	const [cmd, ...pre] = options.command;
	const args = [
		...pre,
		"-p",
		prompt,
		"--model",
		options.model,
		"--setting-sources",
		"project",
		"--strict-mcp-config",
		"--permission-mode",
		"bypassPermissions",
		"--output-format",
		"stream-json",
		"--verbose",
		"--no-session-persistence",
		"--max-budget-usd",
		String(options.budgetUsd),
	];
	const started = Date.now();
	const result = await run(cmd, args, {
		cwd: workspace,
		timeoutMs: options.timeoutMin * 60_000,
		stdoutFile: `${streamPath}.tmp`,
	});
	await rename(`${streamPath}.tmp`, streamPath);
	const stderrPath = join(dir, "agent.stderr.log");
	if (result.stderr.trim()) await writeFile(stderrPath, result.stderr);
	else await rm(stderrPath, { force: true });
	return parseAgentStream(await readFile(streamPath, "utf8"), library, Date.now() - started, result.timedOut);
}

/** Derives metrics from a stream-json transcript; every line is untrusted and narrowed before use. */
export function parseAgentStream(stream: string, library: Library, wallMs: number, timedOut: boolean): AgentMetrics {
	const toolCalls: Record<string, number> = {};
	let docLookups = 0;
	let assistantTurns = 0;
	const usageById = new Map<string, JsonRecord>();
	let result: JsonRecord | undefined;

	for (const line of stream.split("\n")) {
		const event = parseJson(line);
		if (!isRecord(event)) continue;
		const type = str(event, "type");
		if (type === "result") result = event;
		if (type !== "assistant") continue;
		const message = rec(event, "message");
		if (!message) continue;
		assistantTurns++;
		const id = str(message, "id");
		const usage = rec(message, "usage");
		if (id && usage) usageById.set(id, usage);
		const content = message.content;
		if (!Array.isArray(content)) continue;
		for (const block of content) {
			if (!isRecord(block) || str(block, "type") !== "tool_use") continue;
			const name = str(block, "name") ?? "unknown";
			toolCalls[name] = (toolCalls[name] ?? 0) + 1;
			if (isDocLookup(name, rec(block, "input") ?? {}, library)) docLookups++;
		}
	}

	if (result) {
		const usage = rec(result, "usage") ?? {};
		return {
			costUsd: num(result, "total_cost_usd") ?? null,
			turns: num(result, "num_turns") ?? assistantTurns,
			durationMs: num(result, "duration_ms") ?? wallMs,
			inputTokens: inputTokens(usage),
			outputTokens: num(usage, "output_tokens") ?? 0,
			isError: result.is_error === true || timedOut,
			timedOut,
			toolCalls,
			docLookups,
		};
	}
	const usages = [...usageById.values()];
	return {
		costUsd: null,
		turns: assistantTurns,
		durationMs: wallMs,
		inputTokens: usages.reduce((sum, usage) => sum + inputTokens(usage), 0),
		outputTokens: usages.reduce((sum, usage) => sum + (num(usage, "output_tokens") ?? 0), 0),
		isError: true,
		timedOut,
		toolCalls,
		docLookups,
	};
}

const inputTokens = (usage: JsonRecord) =>
	(num(usage, "input_tokens") ?? 0) +
	(num(usage, "cache_creation_input_tokens") ?? 0) +
	(num(usage, "cache_read_input_tokens") ?? 0);

function isDocLookup(tool: string, input: JsonRecord, library: Library): boolean {
	if (tool === "WebFetch" || tool === "WebSearch") return true;
	if (tool === "Skill") return library.skill !== null && str(input, "skill") === library.skill;
	if (tool === "Bash") return library.docsCommand.test(str(input, "command") ?? "");
	if (tool === "Read") {
		const path = str(input, "file_path") ?? "";
		return path.includes("/.claude/skills/") || library.docsPaths.some((docs) => path.includes(`/${docs}`));
	}
	return false;
}
