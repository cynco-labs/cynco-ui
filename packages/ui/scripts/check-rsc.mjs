// Loads the built package the way a React Server Components bundler does: React resolves to its react-server
// build (no hooks, no createContext) and every "use client" module is replaced by references to its exports.
// Fails if any server-side module touches client-only React, or if a pure helper lands in a client module.
import { register } from "node:module";
import { strict as assert } from "node:assert";

if (!process.execArgv.includes("--conditions=react-server")) {
	const { spawnSync } = await import("node:child_process");
	const run = spawnSync(process.execPath, ["--conditions=react-server", ...process.argv.slice(1)], { stdio: "inherit" });
	process.exit(run.status ?? 1);
}

register(
	"data:text/javascript," +
		encodeURIComponent(`
export async function load(url, context, next) {
	const result = await next(url, context);
	if (result.format !== "module" || result.source == null) return result;
	const source = String(result.source).trimStart();
	if (!/^["']use client["']/.test(source)) return result;
	const listed = [...source.matchAll(/export\\s*\\{([^}]*)\\}/g)].flatMap((m) => m[1].split(",")).map((s) => s.trim().split(/\\s+as\\s+/).pop());
	const declared = [...source.matchAll(/export\\s+(?:async\\s+)?(?:function\\*?|const|let|var|class)\\s+([\\w$]+)/g)].map((m) => m[1]);
	const names = [...new Set([...listed, ...declared])].filter((n) => n && n !== "default");
	const body = names.map((n) => "export const " + n + " = { $$typeof: Symbol.for('react.client.reference'), name: " + JSON.stringify(n) + " };").join("\\n");
	return { format: "module", source: body, shortCircuit: true };
}`),
);

const isReference = (v) => typeof v === "object" && v !== null && v.$$typeof === Symbol.for("react.client.reference");

for (const entry of ["../dist/index.js", "../dist/ai.js"]) {
	const mod = await import(new URL(entry, import.meta.url).href);
	assert.ok(Object.keys(mod).length > 0, `${entry} has exports`);
}

const ui = await import(new URL("../dist/index.js", import.meta.url).href);
// Helpers a server component calls directly must be real functions, not client references.
const serverHelpers = ["formatCurrency", "formatDocAmount", "amountInWords", "draftLineTotals", "sumAmounts", "parseAmount", "toSen", "fromSen", "cn", "salesLineAmount", "buildSalesTotals", "journalTotals"];
for (const name of serverHelpers) {
	assert.ok(name in ui, `${name} is exported`);
	assert.ok(!isReference(ui[name]), `${name} must live in a server-safe module, not a "use client" one`);
	assert.equal(typeof ui[name], "function", `${name} is callable on the server`);
}
assert.equal(ui.formatDocAmount("1234.5"), "1,234.50");
console.log(`RSC check passed: both entries load under react-server; ${serverHelpers.length} helpers callable on the server.`);
