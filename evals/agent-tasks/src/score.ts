import { readdir, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium, type Page } from "playwright";
import type { Library } from "./libraries.ts";
import { run, start } from "./proc.ts";
import {
	type AxeCounts,
	type BrowserMetrics,
	type BuildMetrics,
	type ScoreRecord,
	type SourceMetrics,
	VIEWPORTS,
	type Viewport,
} from "./types.ts";

const COMMAND_TIMEOUT_MS = 5 * 60_000;
const SHOT_WIDTHS: readonly Viewport[] = [375, 1280];

/** Neutral checks on a workspace: build, a real browser, and a scan of the source the agent wrote. */
export async function scoreWorkspace(
	dir: string,
	shotsDir: string,
	library: Library,
	baseDir: string | null,
): Promise<ScoreRecord> {
	const build = await checkBuild(dir);
	let browser: BrowserMetrics | null = null;
	let browserError: string | null = null;
	if (build.ok) {
		try {
			browser = await checkBrowser(dir, shotsDir);
		} catch (error) {
			browserError = error instanceof Error ? error.message : String(error);
		}
	}
	const source = await scanSource(dir, library, baseDir);
	return { build, browser, browserError, source };
}

async function checkBuild(dir: string): Promise<BuildMetrics> {
	const typecheck = await run("npm", ["run", "typecheck"], { cwd: dir, timeoutMs: COMMAND_TIMEOUT_MS });
	const typeErrors = `${typecheck.stdout}\n${typecheck.stderr}`.match(/error TS\d+/g)?.length ?? 0;
	const build = await run("npm", ["run", "build"], { cwd: dir, timeoutMs: COMMAND_TIMEOUT_MS });
	const ok = build.code === 0 && !build.timedOut;
	if (ok) return { ok, typeErrors, buildErrors: [] };
	const lines = `${build.stdout}\n${build.stderr}`
		// biome-ignore lint/suspicious/noControlCharactersInRegex: strips terminal colour codes
		.replace(/\u001b\[[0-9;]*m/g, "")
		.split("\n")
		.filter((line) => line.trim() && !/^\s+at /.test(line));
	const errors = lines.filter((line) => /error/i.test(line));
	return { ok, typeErrors, buildErrors: (errors.length > 0 ? errors : lines.slice(-10)).slice(0, 10) };
}

async function checkBrowser(dir: string, shotsDir: string): Promise<BrowserMetrics> {
	const port = await freePort();
	const server = start(
		join(dir, "node_modules/.bin/vite"),
		["preview", "--port", String(port), "--strictPort", "--host", "127.0.0.1"],
		dir,
	);
	const url = `http://127.0.0.1:${port}/`;
	const browser = await chromium.launch();
	try {
		await waitForServer(url, server.output);
		// axe-core/playwright refuses pages made with browser.newPage().
		const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
		let consoleErrors = 0;
		page.on("console", (message) => {
			if (message.type() === "error") consoleErrors++;
		});
		page.on("pageerror", () => {
			consoleErrors++;
		});
		await load(page, url);
		// biome-ignore lint/performance/useDomNodeTextContent: innerText skips hidden nodes, so a mounted but blank app does not count
		const rendered = await page.evaluate(() => document.body.innerText.trim().length > 0);
		const axe = countAxe(await new AxeBuilder({ page }).analyze());

		const overflow: Record<Viewport, boolean> = { 320: false, 375: false, 768: false, 1280: false };
		for (const width of VIEWPORTS) {
			await page.setViewportSize({ width, height: 900 });
			await page.waitForTimeout(300);
			overflow[width] = await page.evaluate(
				() => document.documentElement.scrollWidth > document.documentElement.clientWidth,
			);
			if (SHOT_WIDTHS.includes(width)) {
				await page.screenshot({ path: join(shotsDir, `${width}.png`), fullPage: true });
			}
		}

		await load(page, url);
		const focusVisible = await probeFocus(page);
		return { rendered, consoleErrors, axe, overflow, focusVisible };
	} finally {
		await browser.close();
		server.stop();
	}
}

async function load(page: Page, url: string): Promise<void> {
	await page.goto(url, { waitUntil: "networkidle" });
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	// Lets entrance animations settle before anything is measured or captured.
	await page.waitForTimeout(1000);
}

function countAxe(results: { violations: { impact?: string | null; nodes: unknown[] }[] }): AxeCounts {
	const counts: AxeCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
	for (const violation of results.violations) {
		const impact = violation.impact;
		if (impact === "critical" || impact === "serious" || impact === "moderate" || impact === "minor") {
			counts[impact] += violation.nodes.length;
		}
	}
	return counts;
}

/**
 * Tabs through up to 30 stops and counts how many look different focused than they did before anything
 * had focus. The element or its parent may carry the ring, since some inputs draw it on their wrapper.
 */
async function probeFocus(page: Page): Promise<{ checked: number; visible: number }> {
	const state = await page.evaluateHandle(() => {
		const ring = (el: Element | null) => {
			if (!el) return "";
			const s = getComputedStyle(el);
			const own = [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderColor, s.backgroundColor];
			return own.join("|");
		};
		const look = (el: Element) => `${ring(el)}#${ring(el.parentElement)}`;
		const before = new Map<Element, string>();
		for (const el of document.querySelectorAll("a[href], button, input, select, textarea, summary, [tabindex]")) {
			before.set(el, look(el));
		}
		return { look, before, seen: new Set<Element>() };
	});
	let checked = 0;
	let visible = 0;
	for (let i = 0; i < 30; i++) {
		await page.keyboard.press("Tab");
		await page.waitForTimeout(150);
		const stop = await page.evaluate(({ look, before, seen }) => {
			const el = document.activeElement;
			if (!el || el === document.body) return "none";
			if (seen.has(el)) return "repeat";
			seen.add(el);
			const prior = before.get(el);
			if (prior === undefined) return "unknown";
			return prior === look(el) ? "same" : "changed";
		}, state);
		if (stop === "repeat") break;
		if (stop === "same" || stop === "changed") checked++;
		if (stop === "changed") visible++;
	}
	await state.dispose();
	return { checked, visible };
}

async function scanSource(dir: string, library: Library, baseDir: string | null): Promise<SourceMetrics> {
	const metrics: SourceMetrics = { files: 0, lines: 0, rawInteractive: 0, libraryImports: 0, offSystemStyles: 0 };
	const imported = new Set<string>();
	const entries = await readdir(join(dir, "src"), { recursive: true });
	for (const entry of entries) {
		const path = `src/${entry}`;
		if (!path.endsWith(".tsx") || library.ownedDirs.some((owned) => path.startsWith(`${owned}/`))) continue;
		const text = await readFile(join(dir, path), "utf8");
		if (baseDir && (await readIfExists(join(baseDir, path))) === text) continue;
		metrics.files++;
		metrics.lines += text.split("\n").length;
		metrics.rawInteractive += countMatches(text, RAW_INTERACTIVE);
		metrics.offSystemStyles += OFF_SYSTEM.reduce((sum, pattern) => sum + countMatches(text, pattern), 0);
		for (const match of text.matchAll(IMPORT)) {
			if (library.importPattern.test(match[2])) for (const name of importedNames(match[1])) imported.add(name);
		}
	}
	metrics.libraryImports = imported.size;
	return metrics;
}

const RAW_INTERACTIVE = /<(button|input|select|textarea|dialog|table)[\s>/]/g;
const PALETTE =
	"slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const OFF_SYSTEM = [
	/(?<![\w&])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
	/\b(?:rgba?|hsla?|oklch)\(/g,
	new RegExp(
		`\\b(?:bg|text|border|ring|outline|from|via|to|fill|stroke|divide|placeholder|accent|caret|decoration|shadow)-(?:(?:${PALETTE})-(?:50|[1-9]00|950)|white|black)\\b`,
		"g",
	),
	/\b(?:text|leading|tracking|p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|w|h|min-w|max-w|min-h|max-h|size|rounded(?:-[a-z]+)?|top|left|right|bottom|inset(?:-[xy])?|bg|border(?:-[trblxy])?|ring|shadow|fill|stroke|from|via|to)-\[/g,
];
const IMPORT = /import\s+(?:type\s+)?([^"';]*?)\s+from\s+["']([^"']+)["']/g;

function importedNames(clause: string): string[] {
	const names: string[] = [];
	const named = clause.match(/\{([\s\S]*)\}/);
	if (named) {
		for (const part of named[1].split(",")) {
			const name = part
				.trim()
				.replace(/^type\s+/, "")
				.split(/\s+as\s+/)[0];
			if (name) names.push(name);
		}
	}
	const outside = clause
		.replace(/\{[\s\S]*\}/, "")
		.replace(/,/g, " ")
		.trim();
	if (outside) names.push(outside.startsWith("*") ? "*" : outside);
	return names;
}

function countMatches(text: string, pattern: RegExp): number {
	return text.match(pattern)?.length ?? 0;
}

async function readIfExists(path: string): Promise<string | null> {
	try {
		return await readFile(path, "utf8");
	} catch {
		return null;
	}
}

function freePort(): Promise<number> {
	return new Promise((resolve, reject) => {
		const server = createServer();
		server.on("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			const port = typeof address === "object" && address ? address.port : 0;
			server.close(() => resolve(port));
		});
	});
}

async function waitForServer(url: string, output: () => string): Promise<void> {
	const deadline = Date.now() + 30_000;
	while (Date.now() < deadline) {
		try {
			if ((await fetch(url)).ok) return;
		} catch {
			// Not listening yet.
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error(`vite preview did not start at ${url}\n${output()}`);
}
