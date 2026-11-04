#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
/**
 * One-time migration tool: converts the legacy createElement previews (`Name: [group, height, code]`)
 * into readable TSX demos in apps/docs/src/demos/<Name>.tsx and seeds packages/ui/registry/meta.json.
 *
 *   node scripts/convert-demos.mjs <previews.js> [--force] [--only=Name,Name]
 *
 * The preview module is CommonJS and exports `{ Name: [group, heightPx, code] }`. The code defines
 * `function App(){…}` with `h` = React.createElement, `A` = the library namespace (`A.Icons.X` = Phosphor,
 * `A.Recharts.X` = recharts, `A.useReactTable` = @tanstack/react-table), `I` = `A.Icons`, `S` = useState and
 * `row(...)` = a wrapping flex row. Existing demo files are kept unless --force is given, because demos are
 * hand-edited after conversion: they are the source of truth from then on.
 */
import { createRequire, register } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "apps/docs");
const DEMOS = join(DOCS, "src/demos");
const requireDocs = createRequire(join(DOCS, "package.json"));
const { parse } = await import(pathToFileURL(requireDocs.resolve("@babel/parser")).href);
const traverseMod = await import(pathToFileURL(requireDocs.resolve("@babel/traverse")).href);
const generatorMod = await import(pathToFileURL(requireDocs.resolve("@babel/generator")).href);
const t = await import(pathToFileURL(requireDocs.resolve("@babel/types")).href);
const prettierMod = await import(pathToFileURL(requireDocs.resolve("prettier")).href);
const prettier = prettierMod.format ? prettierMod : prettierMod.default;
const traverse = traverseMod.default?.default ?? traverseMod.default ?? traverseMod.traverse;
const generate = generatorMod.generate ?? generatorMod.default?.default ?? generatorMod.default;

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = (args.find((a) => a.startsWith("--only=")) ?? "").slice(7).split(",").filter(Boolean);
const previewsPath = args.find((a) => !a.startsWith("--"));
if (!previewsPath) {
	console.error("usage: node scripts/convert-demos.mjs <previews.js> [--force] [--only=A,B]");
	process.exit(1);
}
const SKIP = new Set(["EmptyState", "StackBadge"]);

// ---- export map: which names come from @cynco-labs/ui and which from @cynco-labs/ui/ai
register(
	"data:text/javascript," +
		encodeURIComponent(
			`export async function load(u,c,n){ if(u.endsWith('.css')) return {format:'module',source:'export default {}',shortCircuit:true}; return n(u,c); }`,
		),
);
const MAIN = new Set(Object.keys(await import(pathToFileURL(join(ROOT, "packages/ui/dist/index.js")).href)));
const AI = new Set(Object.keys(await import(pathToFileURL(join(ROOT, "packages/ui/dist/ai.js")).href)));
const TANSTACK = new Set([
	"useReactTable",
	"getCoreRowModel",
	"getSortedRowModel",
	"getPaginationRowModel",
	"flexRender",
]);
const REACT_HOOKS = new Set([
	"useState",
	"useEffect",
	"useRef",
	"useMemo",
	"useCallback",
	"useReducer",
	"useLayoutEffect",
	"useId",
	"Fragment",
]);
const SOURCE_ORDER = [
	"react",
	"@phosphor-icons/react",
	"recharts",
	"@tanstack/react-table",
	"@cynco-labs/ui",
	"@cynco-labs/ui/ai",
];
const ALIAS_PREFIX = { recharts: "Recharts", "@phosphor-icons/react": "Ph", "@tanstack/react-table": "Tanstack" };

function libSource(name) {
	if (TANSTACK.has(name)) return "@tanstack/react-table";
	if (MAIN.has(name)) return "@cynco-labs/ui";
	if (AI.has(name)) return "@cynco-labs/ui/ai";
	throw new Error(`A.${name} is not exported by @cynco-labs/ui or @cynco-labs/ui/ai`);
}

const VALID_ATTR = /^[A-Za-z_][\w-]*(:[\w-]+)?$/;

function textChild(s) {
	if (s === "") return null;
	if (/[{}<>&\n\r\t"]/.test(s) || /^\s|\s$/.test(s)) return t.jsxExpressionContainer(t.stringLiteral(s));
	return t.jsxText(s);
}

function toChild(node) {
	if (t.isJSXElement(node) || t.isJSXFragment(node)) return node;
	if (t.isStringLiteral(node)) return textChild(node.value);
	if (t.isNullLiteral(node) || t.isIdentifier(node, { name: "undefined" })) return null;
	return t.jsxExpressionContainer(node);
}

function attrValue(v) {
	if (t.isStringLiteral(v) && !/[\n\r\\"]/.test(v.value)) return t.stringLiteral(v.value);
	if (t.isBooleanLiteral(v, { value: true })) return null;
	return t.jsxExpressionContainer(v);
}

function propsToAttrs(props) {
	if (!props || t.isNullLiteral(props) || t.isIdentifier(props, { name: "undefined" })) return [];
	if (!t.isObjectExpression(props)) return [t.jsxSpreadAttribute(props)];
	const out = [];
	for (const p of props.properties) {
		if (t.isSpreadElement(p)) out.push(t.jsxSpreadAttribute(p.argument));
		else if (t.isObjectProperty(p) && !p.computed) {
			const key = t.isIdentifier(p.key) ? p.key.name : t.isStringLiteral(p.key) ? p.key.value : null;
			if (key && VALID_ATTR.test(key)) out.push(t.jsxAttribute(t.jsxIdentifier(key), attrValue(p.value)));
			else out.push(t.jsxSpreadAttribute(t.objectExpression([p])));
		} else out.push(t.jsxSpreadAttribute(t.objectExpression([p])));
	}
	return out;
}

function jsxName(node) {
	if (t.isIdentifier(node)) return t.jsxIdentifier(node.name);
	if (t.isMemberExpression(node) && !node.computed && t.isIdentifier(node.property)) {
		const obj = jsxName(node.object);
		return obj ? t.jsxMemberExpression(obj, t.jsxIdentifier(node.property.name)) : null;
	}
	return null;
}

function element(nameNode, attrs, children) {
	const kids = children.map(toChild).filter(Boolean);
	const selfClosing = kids.length === 0;
	return t.jsxElement(
		t.jsxOpeningElement(nameNode, attrs, selfClosing),
		selfClosing ? null : t.jsxClosingElement(nameNode),
		kids,
		selfClosing,
	);
}

function usesThisOrArguments(fnPath) {
	let found = false;
	fnPath.traverse({
		ThisExpression(p) {
			found = true;
			p.stop();
		},
		Identifier(p) {
			if (p.node.name === "arguments" && p.isReferencedIdentifier()) {
				found = true;
				p.stop();
			}
		},
		FunctionExpression(p) {
			p.skip();
		},
		FunctionDeclaration(p) {
			p.skip();
		},
	});
	return found;
}

async function convert(name, code) {
	const ast = parse(code, { sourceType: "module", plugins: ["jsx"] });
	const imports = new Map(); // local -> {source, imported}
	const taken = new Set();
	const problems = [];

	// reserve every binding name and every A.X name first, so library names stay unaliased
	traverse(ast, {
		Scopable(p) {
			for (const b of Object.keys(p.scope.bindings)) taken.add(b);
		},
	});
	const reserved = new Map();
	for (const m of code.matchAll(/\bA\.(?!Icons\b|Recharts\b)(\w+)/g)) {
		if (taken.has(m[1]) && !reserved.has(m[1])) problems.push(`local binding shadows library name ${m[1]}`);
		reserved.set(m[1], libSource(m[1]));
	}
	function local(source, imported) {
		for (const [l, v] of imports) if (v.source === source && v.imported === imported) return l;
		let l = imported;
		const clash = () =>
			(taken.has(l) && !(reserved.get(l) === source)) ||
			(imports.has(l) && imports.get(l).source !== source) ||
			(reserved.has(l) && reserved.get(l) !== source);
		if (clash()) l = (ALIAS_PREFIX[source] ?? "UI") + imported;
		while (clash()) l = `_${l}`;
		imports.set(l, { source, imported });
		return l;
	}

	// pass 1: inline simple aliases `var R = A.Recharts`, `var T = A.DataTable`, `var NS = A.Icons`
	const nsAlias = new Map(); // alias -> "Icons" | "Recharts" | libName
	traverse(ast, {
		VariableDeclarator(p) {
			const { id, init } = p.node;
			if (!t.isIdentifier(id) || !t.isMemberExpression(init) || !t.isIdentifier(init.object, { name: "A" })) return;
			if (init.computed || !t.isIdentifier(init.property)) return;
			const b = p.scope.getBinding(id.name);
			if (!b || b.constantViolations.length) return;
			nsAlias.set(id.name, init.property.name);
			if (init.property.name === "Icons" || init.property.name === "Recharts") {
				const decl = p.parentPath;
				if (decl.node.declarations.length === 1) decl.remove();
				else p.remove();
			} else {
				for (const ref of b.referencePaths)
					ref.replaceWith(t.identifier(local(libSource(init.property.name), init.property.name)));
				const decl = p.parentPath;
				if (decl.node.declarations.length === 1) decl.remove();
				else p.remove();
			}
		},
	});

	// pass 2: names, hooks, h()/row() -> JSX
	traverse(ast, {
		MemberExpression: {
			exit(p) {
				const { object, property, computed } = p.node;
				if (computed || !t.isIdentifier(property)) return;
				const prop = property.name;
				// A.Icons.X / A.Recharts.X
				if (
					t.isMemberExpression(object) &&
					t.isIdentifier(object.object, { name: "A" }) &&
					t.isIdentifier(object.property)
				) {
					if (object.property.name === "Icons") {
						p.replaceWith(t.identifier(local("@phosphor-icons/react", prop)));
						return;
					}
					if (object.property.name === "Recharts") {
						p.replaceWith(t.identifier(local("recharts", prop)));
						return;
					}
				}
				if (t.isIdentifier(object)) {
					const o = object.name;
					if (o === "I" && !p.scope.hasBinding("I")) {
						p.replaceWith(t.identifier(local("@phosphor-icons/react", prop)));
						return;
					}
					if (nsAlias.get(o) === "Icons") {
						p.replaceWith(t.identifier(local("@phosphor-icons/react", prop)));
						return;
					}
					if (nsAlias.get(o) === "Recharts") {
						p.replaceWith(t.identifier(local("recharts", prop)));
						return;
					}
					if (o === "React" && REACT_HOOKS.has(prop)) {
						p.replaceWith(t.identifier(local("react", prop)));
						return;
					}
					if (o === "A" && prop !== "Icons" && prop !== "Recharts" && !p.scope.hasBinding("A")) {
						p.replaceWith(t.identifier(local(libSource(prop), prop)));
						return;
					}
				}
			},
		},
		CallExpression: {
			exit(p) {
				const { callee, arguments: a } = p.node;
				if (t.isIdentifier(callee, { name: "S" }) && !p.scope.hasBinding("S")) {
					p.node.callee = t.identifier(local("react", "useState"));
					return;
				}
				if (t.isIdentifier(callee, { name: "row" }) && !p.scope.hasBinding("row")) {
					p.replaceWith(
						element(
							t.jsxIdentifier("div"),
							[t.jsxAttribute(t.jsxIdentifier("className"), t.stringLiteral("flex flex-wrap items-center gap-2"))],
							a,
						),
					);
					return;
				}
				if (!t.isIdentifier(callee, { name: "h" }) || p.scope.hasBinding("h")) return;
				const [type, props, ...children] = a;
				if (t.isSpreadElement(type) || children.some((c) => t.isSpreadElement(c))) {
					problems.push("h() with spread arguments");
					p.node.callee = t.identifier(local("react", "createElement"));
					return;
				}
				// Fragment
				if (t.isIdentifier(type) && imports.get(type.name)?.imported === "Fragment" && (!props || t.isNullLiteral(props))) {
					p.replaceWith(
						t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), children.map(toChild).filter(Boolean)),
					);
					return;
				}
				let nameNode = null;
				if (t.isStringLiteral(type)) nameNode = t.jsxIdentifier(type.value);
				else if (t.isIdentifier(type) && /^[A-Z_$]/.test(type.name)) nameNode = t.jsxIdentifier(type.name);
				else if (t.isMemberExpression(type)) nameNode = jsxName(type);
				if (!nameNode) {
					p.node.callee = t.identifier(local("react", "createElement"));
					return;
				}
				p.replaceWith(element(nameNode, propsToAttrs(props), children));
			},
		},
	});

	// pass 3: useState pairs -> destructuring; function expressions -> arrows; var -> const/let; App -> export default
	traverse(ast, {
		Program(p) {
			p.scope.crawl();
		},
		VariableDeclarator(p) {
			const { id, init } = p.node;
			if (
				!t.isIdentifier(id) ||
				!t.isCallExpression(init) ||
				!t.isIdentifier(init.callee) ||
				imports.get(init.callee.name)?.imported !== "useState"
			)
				return;
			const b = p.scope.getBinding(id.name);
			if (!b || b.constantViolations.length) return;
			const refs = b.referencePaths;
			const idx = (r) => {
				const m = r.parentPath;
				return m.isMemberExpression({ object: r.node, computed: true }) && t.isNumericLiteral(m.node.property)
					? m.node.property.value
					: -1;
			};
			if (!refs.every((r) => idx(r) === 0 || idx(r) === 1)) return;
			// names: `var c=S(0), n=c[0], setN=c[1]` keeps n/setN; otherwise value/setter from the state name
			let names = [null, null];
			const aliasDecls = [];
			for (const r of refs) {
				const m = r.parentPath;
				const d = m.parentPath;
				if (d.isVariableDeclarator({ init: m.node }) && t.isIdentifier(d.node.id)) {
					const ab = d.scope.getBinding(d.node.id.name);
					if (ab && !ab.constantViolations.length && !names[idx(r)]) {
						names[idx(r)] = d.node.id.name;
						aliasDecls.push(d);
					}
				}
			}
			const base = id.name;
			const cap = base[0].toUpperCase() + base.slice(1);
			names = [names[0] ?? base, names[1] ?? `set${cap}`];
			if (!names[0].length || (names[1] !== `set${cap}` ? false : p.scope.hasBinding(names[1]))) return;
			for (const d of aliasDecls) d.remove();
			for (const r of refs) {
				if (r.parentPath.removed || !r.parentPath.node) continue;
				r.parentPath.replaceWith(t.identifier(names[idx(r)]));
			}
			p.node.id = t.arrayPattern([t.identifier(names[0]), t.identifier(names[1])]);
		},
	});
	traverse(ast, {
		FunctionExpression: {
			exit(p) {
				if (p.node.id || p.node.generator || usesThisOrArguments(p)) return;
				let body = p.node.body;
				if (body.body.length === 1 && t.isReturnStatement(body.body[0]) && body.body[0].argument)
					body = body.body[0].argument;
				const arrow = t.arrowFunctionExpression(p.node.params, body, p.node.async);
				p.replaceWith(arrow);
			},
		},
	});
	traverse(ast, {
		Program: {
			exit(p) {
				p.scope.crawl();
			},
		},
	});
	traverse(ast, {
		VariableDeclaration(p) {
			if (p.node.kind !== "var") return;
			let constant = true;
			for (const d of p.node.declarations) {
				if (!d.init) constant = false;
				const ids = Object.keys(t.getBindingIdentifiers(d.id));
				for (const n of ids) {
					const b = p.scope.getBinding(n);
					if (!b || b.constantViolations.length) constant = false;
				}
			}
			if (p.parentPath.isForStatement() || p.parentPath.isForXStatement())
				constant = p.parentPath.isForXStatement() && constant;
			p.node.kind = constant ? "const" : "let";
		},
	});
	let found = false;
	traverse(ast, {
		Program(p) {
			for (const s of p.get("body")) {
				if (s.isFunctionDeclaration() && s.node.id?.name === "App") {
					s.node.id = t.identifier(`${name}Demo`);
					s.replaceWith(t.exportDefaultDeclaration(s.node));
					found = true;
				}
			}
		},
	});
	if (!found) problems.push("no top-level function App");

	// leftovers that the runtime used to provide
	traverse(ast, {
		Identifier(p) {
			if (
				["h", "A", "I", "S", "row", "React", "ReactDOM"].includes(p.node.name) &&
				p.isReferencedIdentifier() &&
				!p.scope.hasBinding(p.node.name)
			)
				problems.push(`free reference to ${p.node.name}`);
		},
	});

	const bySource = new Map();
	for (const [l, { source, imported }] of imports) {
		if (!bySource.has(source)) bySource.set(source, []);
		bySource.get(source).push(l === imported ? imported : `${imported} as ${l}`);
	}
	const header = SOURCE_ORDER.filter((s) => bySource.has(s))
		.map((s) => `import { ${[...new Set(bySource.get(s))].sort().join(", ")} } from "${s}";`)
		.join("\n");
	// shorthand properties ({ data: data } -> { data })
	traverse(ast, {
		ObjectProperty(p) {
			const { key, value, computed } = p.node;
			if (!computed && t.isIdentifier(key) && t.isIdentifier(value) && key.name === value.name) p.node.shorthand = true;
		},
	});
	// one blank line between top-level statements
	const body = ast.program.body.map((s) => generate(s, { jsescOption: { minimal: true } }).code).join("\n\n");
	const out = await prettier.format(`${header}\n\n${body}\n`, {
		parser: "babel-ts",
		useTabs: true,
		printWidth: 100,
		objectWrap: "collapse",
	});
	return { out, problems };
}

const require = createRequire(import.meta.url);
const previews = require(resolve(previewsPath));
mkdirSync(DEMOS, { recursive: true });
let written = 0;
let kept = 0;
const report = [];
for (const [name, [, , code]] of Object.entries(previews)) {
	if (SKIP.has(name) || (only.length && !only.includes(name))) continue;
	const file = join(DEMOS, `${name}.tsx`);
	if (existsSync(file) && !force) {
		kept++;
		continue;
	}
	try {
		const { out, problems } = await convert(name, code);
		writeFileSync(file, out);
		written++;
		if (problems.length) report.push(`${name}: ${[...new Set(problems)].join("; ")}`);
	} catch (e) {
		report.push(`${name}: FAILED ${e.message.split("\n")[0]}`);
	}
}
console.log(`demos: ${written} written, ${kept} kept (use --force to overwrite)`);
if (report.length) console.log(report.join("\n"));
