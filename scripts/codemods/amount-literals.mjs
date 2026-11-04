#!/usr/bin/env node
/**
 * Rewrites money written as a number into the decimal string the library asks for.
 *
 *   node scripts/codemods/amount-literals.mjs --dry-run                     # report, change nothing
 *   node scripts/codemods/amount-literals.mjs                               # rewrite every demo
 *   node scripts/codemods/amount-literals.mjs BankFeedList.tsx BillCard.tsx # rewrite some of them
 *
 * `Amount` is `string | number`, so `total={1234.5}` type-checks and then formats through a float.
 * This finds every numeric literal whose contextual type is `Amount` — a prop, an array element, an
 * object property, a `satisfies`-ed fixture — and writes it as `"1234.50"`: the same figure, exact,
 * and printed with the sen the rest of the library prints.
 *
 * It asks the TypeScript compiler for the contextual type rather than matching prop names, so a
 * `quantity` stays a number and a `totalAmount` does not. A literal it cannot write exactly (more
 * than two decimals, an exponent) is left alone and reported as MANUAL.
 *
 * Running it twice changes nothing: the second run finds strings, not numbers.
 *
 * Arguments are file names or paths under apps/docs/src/demos; with none it covers them all.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const UI = join(ROOT, "packages/ui");
const DEMOS = join(ROOT, "apps/docs/src/demos");
const ts = createRequire(join(UI, "package.json"))("typescript");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const picked = args
	.filter((a) => !a.startsWith("--"))
	.map((a) => resolve(a.includes("/") ? join(ROOT, a) : join(DEMOS, a)));

const config = ts.getParsedCommandLineOfConfigFile(
	join(UI, "tsconfig.json"),
	{},
	{
		...ts.sys,
		onUnRecoverableConfigFileDiagnostic: (d) => {
			throw new Error(ts.flattenDiagnosticMessageText(d.messageText, "\n"));
		},
	},
);
const program = ts.createProgram({ rootNames: config.fileNames, options: config.options });
const checker = program.getTypeChecker();

/** True when `type` was written as the `Amount` alias. A union like `Amount | null` flattens and loses it. */
function isAmountType(type) {
	if (!type) return false;
	if (type.aliasSymbol?.name === "Amount") return true;
	return type.isUnion() ? type.types.some(isAmountType) : false;
}

/** True when the written type names `Amount` anywhere — `Amount`, `Amount | null`, `Amount[]`. */
function namesAmount(typeNode) {
	if (!typeNode) return false;
	if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName) && typeNode.typeName.text === "Amount")
		return true;
	let found = false;
	ts.forEachChild(typeNode, (child) => {
		found ||= namesAmount(child);
	});
	return found;
}

const writtenTypeOf = (symbol) => symbol?.declarations?.[0]?.type ?? null;

/** The property `name` of `type`, looking inside a union for it. */
function propertyOf(type, name) {
	if (!type) return null;
	const direct = checker.getPropertyOfType(type, name);
	if (direct) return direct;
	if (type.isUnion())
		for (const t of type.types) {
			const found = checker.getPropertyOfType(t, name);
			if (found) return found;
		}
	return null;
}

/**
 * The type as it was *written* for the slot this expression fills: a JSX attribute, an object
 * property, an array element, a call argument or an annotated variable. The written form is what
 * keeps the `Amount` alias visible, which the resolved type throws away.
 */
function writtenSlotType(node) {
	const parent = node.parent;
	if (!parent) return null;
	if (ts.isJsxExpression(parent) && parent.parent && ts.isJsxAttribute(parent.parent))
		return writtenTypeOf(checker.getSymbolAtLocation(parent.parent.name));
	if (ts.isPropertyAssignment(parent) && parent.initializer === node) {
		const object = parent.parent;
		return writtenTypeOf(propertyOf(checker.getContextualType(object), parent.name.getText(object.getSourceFile())));
	}
	if (ts.isArrayLiteralExpression(parent) || ts.isParenthesizedExpression(parent) || ts.isAsExpression(parent))
		return writtenSlotType(parent);
	if ((ts.isCallExpression(parent) || ts.isNewExpression(parent)) && parent.arguments) {
		const index = parent.arguments.indexOf(node);
		if (index >= 0) return writtenTypeOf(checker.getResolvedSignature(parent)?.parameters[index]);
	}
	if ((ts.isVariableDeclaration(parent) || ts.isPropertyDeclaration(parent)) && parent.type) return parent.type;
	return null;
}

const isAmount = (node) => isAmountType(checker.getContextualType(node)) || namesAmount(writtenSlotType(node));

/**
 * The literal as a decimal string with two places, from its own text so no float rounds it.
 * Null when it cannot be written exactly.
 */
function toDecimalString(text, negative) {
	const clean = text.replace(/_/g, "");
	const m = /^(\d+)(?:\.(\d{0,2}))?$/.exec(clean);
	if (!m) return null;
	const whole = m[1].replace(/^0+(?=\d)/, "");
	const sen = (m[2] ?? "").padEnd(2, "0");
	const value = `${whole}.${sen}`;
	return negative && value !== "0.00" ? `-${value}` : value;
}

const edits = new Map();
const manual = [];

function record(file, start, end, replacement) {
	if (!edits.has(file)) edits.set(file, []);
	edits.get(file).push({ start, end, replacement });
}

for (const source of program.getSourceFiles()) {
	if (source.isDeclarationFile) continue;
	const file = resolve(source.fileName);
	if (!file.startsWith(`${DEMOS}/`)) continue;
	if (picked.length && !picked.includes(file)) continue;

	const visit = (node) => {
		const negative =
			ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand);
		const literal = negative ? node.operand : node;
		if (negative || ts.isNumericLiteral(node)) {
			if (isAmount(node)) {
				const written = toDecimalString(literal.getText(source), negative);
				const where = `${relative(ROOT, file)}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`;
				if (written === null) manual.push(`${where}  ${node.getText(source)} — write it as a decimal string by hand`);
				else record(file, node.getStart(source), node.getEnd(), JSON.stringify(written));
				return;
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(source);
}

const changed = [];
for (const [file, list] of edits) {
	const before = readFileSync(file, "utf8");
	let after = before;
	// Back to front, so an earlier edit never shifts a later one's offsets.
	for (const e of [...list].sort((a, b) => b.start - a.start))
		after = after.slice(0, e.start) + e.replacement + after.slice(e.end);
	if (after === before) continue;
	changed.push(`${relative(ROOT, file)} (${list.length})`);
	if (!DRY_RUN) writeFileSync(file, after);
}

changed.sort();
console.log(`${DRY_RUN ? "Would rewrite" : "Rewrote"} ${changed.length} file${changed.length === 1 ? "" : "s"}.`);
for (const line of changed) console.log(`  ${line}`);
if (manual.length) {
	console.log(`\n${manual.length} literal${manual.length === 1 ? "" : "s"} need a hand:`);
	for (const line of manual) console.log(`  ${line}`);
}
