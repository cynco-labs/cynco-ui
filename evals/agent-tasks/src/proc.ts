import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";

export interface RunResult {
	code: number | null;
	stdout: string;
	stderr: string;
	timedOut: boolean;
}

export interface RunOptions {
	cwd: string;
	timeoutMs?: number;
	/** Stream stdout to this file instead of buffering it. */
	stdoutFile?: string;
}

const ENV = { ...process.env, DO_NOT_TRACK: "1", DISABLE_TELEMETRY: "1" };

/** Runs a command in its own process group so a timeout also kills whatever it spawned. */
export function run(cmd: string, args: string[], options: RunOptions): Promise<RunResult> {
	return new Promise((resolve, reject) => {
		const child = spawn(cmd, args, { cwd: options.cwd, env: ENV, detached: true, stdio: ["ignore", "pipe", "pipe"] });
		let stdout = "";
		let stderr = "";
		let timedOut = false;
		const file = options.stdoutFile ? createWriteStream(options.stdoutFile) : null;
		child.stdout.on("data", (chunk: Buffer) => {
			if (file) file.write(chunk);
			else stdout += chunk.toString();
		});
		child.stderr.on("data", (chunk: Buffer) => {
			stderr += chunk.toString();
		});
		const timer = options.timeoutMs
			? setTimeout(() => {
					timedOut = true;
					killGroup(child.pid);
				}, options.timeoutMs)
			: null;
		child.on("error", reject);
		child.on("close", (code) => {
			if (timer) clearTimeout(timer);
			// Also stops anything the command left running, such as a dev server an agent started.
			killGroup(child.pid);
			const done = () => resolve({ code, stdout, stderr, timedOut });
			if (file) file.end(done);
			else done();
		});
	});
}

/** Starts a long-lived process; the returned function stops it and everything it spawned. */
export function start(cmd: string, args: string[], cwd: string): { stop: () => void; output: () => string } {
	const child = spawn(cmd, args, { cwd, env: ENV, detached: true, stdio: ["ignore", "pipe", "pipe"] });
	let output = "";
	child.stdout.on("data", (chunk: Buffer) => {
		output += chunk.toString();
	});
	child.stderr.on("data", (chunk: Buffer) => {
		output += chunk.toString();
	});
	return { stop: () => killGroup(child.pid), output: () => output };
}

function killGroup(pid: number | undefined): void {
	if (pid === undefined) return;
	try {
		process.kill(-pid, "SIGKILL");
	} catch {
		// Already exited.
	}
}

/**
 * Kills anything still running from an app folder. Agents start dev servers in the background, outside the
 * process group `run` kills, and those servers keep writing into the folder after the agent exits.
 */
export async function stopProcessesIn(dir: string): Promise<void> {
	// Matches on the folder's last two segments because macOS reports /var paths as /private/var.
	const tail = `/${dir.split("/").filter(Boolean).slice(-2).join("/")}`;
	await run("pkill", ["-f", `${tail}/`], { cwd: "/", timeoutMs: 10_000 });
	// `npx vite` runs from the npx cache, so only its working directory names the folder.
	for (const pid of await pidsWorkingIn(tail)) {
		try {
			process.kill(pid, "SIGKILL");
		} catch {
			// Already exited.
		}
	}
}

async function pidsWorkingIn(tail: string): Promise<number[]> {
	let listing: RunResult;
	try {
		listing = await run("lsof", ["-d", "cwd", "-Fpn"], { cwd: "/", timeoutMs: 30_000 });
	} catch {
		return [];
	}
	const pids: number[] = [];
	let pid = 0;
	for (const line of listing.stdout.split("\n")) {
		if (line.startsWith("p")) pid = Number(line.slice(1));
		else if (line.startsWith("n") && pid !== process.pid) {
			const path = line.slice(1);
			if (path.endsWith(tail) || path.includes(`${tail}/`)) pids.push(pid);
		}
	}
	return pids;
}

export async function runOrThrow(cmd: string, args: string[], options: RunOptions): Promise<RunResult> {
	const result = await run(cmd, args, options);
	if (result.code !== 0) {
		const tail = `${result.stdout}\n${result.stderr}`.trim().split("\n").slice(-30).join("\n");
		throw new Error(`${cmd} ${args.join(" ")} failed in ${options.cwd} (exit ${result.code})\n${tail}`);
	}
	return result;
}

/** Runs `fn` over the items with bounded concurrency; one item failing never stops the rest. Returns the failures. */
export async function pool<T>(
	items: readonly T[],
	concurrency: number,
	fn: (item: T) => Promise<void>,
): Promise<number> {
	const queue = [...items];
	let failures = 0;
	const worker = async () => {
		for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
			try {
				await fn(item);
			} catch (error) {
				failures++;
				console.error(error instanceof Error ? error.message : error);
			}
		}
	};
	await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
	return failures;
}
