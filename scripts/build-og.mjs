#!/usr/bin/env node
/**
 * Renders every link-preview frame the docs build wrote (apps/docs/dist/og/**.html, from src/pages/og) to a
 * 1200×630 PNG beside it, then deletes the frames so they never ship.
 *
 *   node scripts/build-og.mjs        (run by `pnpm --filter @cynco-labs/docs build`, after astro build)
 *
 * A frame holds live components, so it needs a real browser: this serves dist over loopback HTTP (the frames load
 * /_astro/ chunks by absolute path) and screenshots each one with the Chrome already on the machine, over Chrome's
 * own DevTools protocol. No browser-automation package. Set CHROME_PATH to use a particular binary.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { delimiter, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "apps/docs/dist");
const FRAMES = join(DIST, "og");

const TYPES = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript",
	".css": "text/css",
	".json": "application/json",
	".svg": "image/svg+xml",
	".png": "image/png",
	".woff2": "font/woff2",
};

function findChrome() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
	if (existsSync(mac)) return mac;
	for (const name of ["google-chrome-stable", "google-chrome", "chromium", "chromium-browser"]) {
		for (const dir of (process.env.PATH ?? "").split(delimiter)) {
			if (dir && existsSync(join(dir, name))) return join(dir, name);
		}
	}
	return null;
}

function* frames(dir) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) yield* frames(full);
		else if (name.endsWith(".html")) yield full;
	}
}

/** Static files from dist, resolved the way the host does: `/x` serves `x.html`. */
function serve() {
	const server = createServer((req, res) => {
		const path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
		const base = resolve(DIST, `.${path}`);
		const file = [base, `${base}.html`, join(base, "index.html")].find(
			(f) => f.startsWith(DIST + sep) && existsSync(f) && statSync(f).isFile(),
		);
		if (!file) return res.writeHead(404).end();
		res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
		res.end(readFileSync(file));
	});
	return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

/**
 * One headless Chrome, driven over its DevTools protocol with Node's own WebSocket. Pages share the browser, so a
 * frame costs its own render, not a browser start; each is shot once it resolves `window.ogReady`.
 */
async function launch(chrome) {
	const profile = mkdtempSync(join(tmpdir(), "cynco-og-"));
	const child = spawn(
		chrome,
		[
			"--headless",
			"--disable-gpu",
			"--hide-scrollbars",
			"--no-first-run",
			"--no-default-browser-check",
			"--disable-extensions",
			"--disable-component-update",
			"--disable-background-networking",
			"--disable-sync",
			"--remote-debugging-port=0",
			`--user-data-dir=${profile}`,
			// CI runners refuse Chrome's sandbox for an unprivileged user; these are our own pages on loopback.
			...(process.env.CI ? ["--no-sandbox"] : []),
			"about:blank",
		],
		{ stdio: "ignore" },
	);
	// A missing binary is an 'error' event, which would otherwise crash the script with no hint of the cause.
	let startError = null;
	child.once("error", (e) => {
		startError = e;
	});
	const portFile = join(profile, "DevToolsActivePort");
	for (let i = 0; !existsSync(portFile) || !readFileSync(portFile, "utf8").includes("\n"); i++) {
		if (startError || i > 300) {
			child.kill();
			rmSync(profile, { recursive: true, force: true });
			throw new Error(`Chrome (${chrome}) did not start: ${startError?.message ?? "no DevTools port after 15s"}`);
		}
		await new Promise((r) => setTimeout(r, 50));
	}
	const [port, path] = readFileSync(portFile, "utf8").trim().split("\n");
	const ws = new WebSocket(`ws://127.0.0.1:${port}${path}`);
	await new Promise((ok, fail) => {
		ws.onopen = ok;
		ws.onerror = fail;
	});

	let next = 0;
	const pending = new Map();
	const waiters = [];
	ws.onmessage = ({ data }) => {
		const msg = JSON.parse(data);
		if (msg.id !== undefined) {
			const p = pending.get(msg.id);
			pending.delete(msg.id);
			if (msg.error) p.fail(new Error(msg.error.message));
			else p.ok(msg.result);
			return;
		}
		for (const w of waiters.filter((w) => w.method === msg.method && w.sessionId === msg.sessionId)) {
			waiters.splice(waiters.indexOf(w), 1);
			w.ok(msg.params);
		}
	};
	const send = (method, params = {}, sessionId) =>
		new Promise((ok, fail) => {
			const id = next++;
			pending.set(id, { ok, fail });
			ws.send(JSON.stringify({ id, method, params, sessionId }));
		});
	const event = (method, sessionId) => new Promise((ok) => waiters.push({ method, sessionId, ok }));

	return {
		async shoot(url, out) {
			const { targetId } = await send("Target.createTarget", { url: "about:blank" });
			try {
				const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
				await send("Page.enable", {}, sessionId);
				// Several frames load at once; without this, all but the newest count as background tabs and are throttled.
				await send("Emulation.setFocusEmulationEnabled", { enabled: true }, sessionId);
				await send(
					"Emulation.setDeviceMetricsOverride",
					{ width: 1200, height: 630, deviceScaleFactor: 1, mobile: false },
					sessionId,
				);
				const loaded = event("Page.loadEventFired", sessionId);
				await send("Page.navigate", { url }, sessionId);
				await loaded;
				const { result } = await send(
					"Runtime.evaluate",
					{ expression: "window.ogReady", awaitPromise: true, returnByValue: true },
					sessionId,
				);
				// The frame resolves `ogReady` to a list of issues; anything else means its script never ran (a 404, an
				// error), and shooting it anyway would ship a blank image without a word.
				if (!Array.isArray(result.value)) throw new Error("the frame never reported ready (no window.ogReady)");
				const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
				writeFileSync(out, Buffer.from(data, "base64"));
				return result.value;
			} finally {
				await send("Target.closeTarget", { targetId });
			}
		},
		async close() {
			// Chrome writes its profile until it exits, so the profile goes only once the process has.
			const gone = child.exitCode !== null || child.signalCode !== null;
			const exited = gone ? Promise.resolve() : new Promise((ok) => child.once("exit", ok));
			await send("Browser.close").catch(() => child.kill());
			ws.close();
			await exited;
			rmSync(profile, { recursive: true, force: true });
		},
	};
}

/** Fails a frame that never settles, so one broken page cannot hang the build. */
const within = (ms, promise) =>
	Promise.race([promise, new Promise((_, fail) => setTimeout(() => fail(new Error(`timed out after ${ms}ms`)), ms))]);

if (!existsSync(FRAMES)) {
	console.error(`No frames at ${relative(ROOT, FRAMES)}; run astro build first.`);
	process.exit(1);
}
const chrome = findChrome();
if (!chrome) {
	console.error("Link-preview images need Google Chrome or Chromium. Install one, or set CHROME_PATH to its binary.");
	process.exit(1);
}

const started = Date.now();
const server = await serve();
const origin = `http://127.0.0.1:${server.address().port}`;
const queue = [...frames(FRAMES)];
const total = queue.length;
const failed = [];
const flagged = [];

let browser;
try {
	browser = await launch(chrome);
	const workers = Array.from({ length: 8 }, async () => {
		for (let frame = queue.shift(); frame; frame = queue.shift()) {
			const path = relative(DIST, frame)
				.split(sep)
				.join("/")
				.replace(/\.html$/, "");
			try {
				const issues = await within(20_000, browser.shoot(`${origin}/${path}`, frame.replace(/\.html$/, ".png")));
				if (issues.length) flagged.push(`${path}: ${issues.join("; ")}`);
				rmSync(frame);
			} catch (e) {
				failed.push(`${path}: ${e.message}`);
			}
		}
	});
	await Promise.all(workers);
} catch (e) {
	console.error(e.message);
	process.exitCode = 1;
} finally {
	await browser?.close();
	server.close();
}
if (process.exitCode) process.exit();

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`Rendered ${total - failed.length} of ${total} link-preview images in ${seconds}s.`);
for (const f of flagged) console.warn(`  check ${f}`);
for (const f of failed) console.error(`  failed ${f}`);
process.exit(failed.length ? 1 : 0);
