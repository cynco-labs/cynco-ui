#!/usr/bin/env node
/**
 * Extracts each registry component's props from the TypeScript source.
 *
 *   node scripts/extract-props.mjs
 *
 * Writes:
 *   packages/ui/registry/props.json  { [name]: { props: [{ name, type, required, default?, description? }],
 *                                                inherits: string[] } | null }
 *
 * Names and order come from meta.json; each is an export of packages/ui/src/index.ts (ai.ts for category "AI").
 * Props declared in packages/ui/src are listed; React, DOM and Base UI props are summarised in `inherits`.
 * `null` means the export is not a component that takes a props object.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UI = join(ROOT, "packages/ui");
const SRC = `${join(UI, "src")}/`;
const ts = createRequire(join(UI, "package.json"))("typescript");

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

const SKIPPED = new Set(["className", "children", "ref", "key"]);
const TRIVIAL_TYPES = new Set(["string", "ReactNode"]);
const TRANSPARENT_UTILITIES = new Set(["Omit", "Pick", "Partial", "Required", "Readonly", "PropsWithChildren"]);
const MAX_TYPE_LENGTH = 80;
const MAX_TYPE_DEPTH = 20;

const isOurs = (node) => {
	const file = node.getSourceFile().fileName;
	return file.startsWith(SRC);
};
const oneLine = (text) => text.replace(/\s+/g, " ").trim();
const resolveAlias = (symbol) =>
	symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
const unwrap = (node) => {
	while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node)))
		node = node.expression;
	return node;
};
const isFunction = (node) =>
	node && (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node));

/** The function that implements a component, seen through forwardRef / memo / Object.assign / re-assignment. */
function implementationOf(symbol, seen = new Set()) {
	symbol = resolveAlias(symbol);
	if (!symbol || seen.has(symbol)) return {};
	seen.add(symbol);
	const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
	if (!decl) return {};
	if (isFunction(decl)) return { fn: decl };
	if (!ts.isVariableDeclaration(decl) || !decl.initializer) return {};
	return implementationOfExpression(unwrap(decl.initializer), seen);
}

function implementationOfExpression(expr, seen) {
	if (isFunction(expr)) return { fn: expr };
	if (ts.isIdentifier(expr) || ts.isPropertyAccessExpression(expr))
		return implementationOf(checker.getSymbolAtLocation(expr), seen);
	if (!ts.isCallExpression(expr)) return {};
	const callee = expr.expression.getText();
	const propsTypeArg = /forwardRef$/.test(callee) ? expr.typeArguments?.[1] : undefined;
	for (const arg of expr.arguments) {
		const found = implementationOfExpression(unwrap(arg), seen);
		if (found.fn) return { fn: found.fn, propsTypeNode: found.propsTypeNode ?? propsTypeArg };
	}
	return { propsTypeNode: propsTypeArg };
}

/** Destructuring defaults of the props parameter: `({ size = "md" })` or `const { size = "md" } = props`. */
function destructuredDefaults(fn) {
	const defaults = new Map();
	const param = fn?.parameters[0];
	if (!param) return defaults;
	const collect = (pattern) => {
		for (const el of pattern.elements) {
			if (!el.initializer || el.dotDotDotToken) continue;
			const key = el.propertyName ?? el.name;
			if (ts.isIdentifier(key) || ts.isStringLiteral(key)) defaults.set(key.text, oneLine(el.initializer.getText()));
		}
	};
	if (ts.isObjectBindingPattern(param.name)) collect(param.name);
	else if (ts.isIdentifier(param.name) && fn.body && ts.isBlock(fn.body)) {
		for (const stmt of fn.body.statements) {
			if (!ts.isVariableStatement(stmt)) continue;
			for (const d of stmt.declarationList.declarations) {
				if (ts.isObjectBindingPattern(d.name) && d.initializer && unwrap(d.initializer).getText() === param.name.text)
					collect(d.name);
			}
		}
	}
	return defaults;
}

/** `cva(base, { variants, defaultVariants })` behind `typeof x`: variant names and their defaults. */
function cvaVariants(typeQuery) {
	const symbol = resolveAlias(checker.getSymbolAtLocation(typeQuery.exprName));
	const decl = symbol?.valueDeclaration;
	const call = decl && ts.isVariableDeclaration(decl) && decl.initializer && unwrap(decl.initializer);
	const options = call && ts.isCallExpression(call) && call.arguments[1];
	const variants = new Map();
	if (!options || !ts.isObjectLiteralExpression(options)) return variants;
	const prop = (name) =>
		options.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === name)?.initializer;
	const declared = prop("variants");
	const defaults = prop("defaultVariants");
	if (declared && ts.isObjectLiteralExpression(declared)) {
		for (const p of declared.properties)
			if (p.name) variants.set(p.name.getText().replace(/^["']|["']$/g, ""), undefined);
	}
	if (defaults && ts.isObjectLiteralExpression(defaults)) {
		for (const p of defaults.properties) {
			const name = p.name?.getText().replace(/^["']|["']$/g, "");
			if (name && variants.has(name) && ts.isPropertyAssignment(p)) variants.set(name, oneLine(p.initializer.getText()));
		}
	}
	return variants;
}

/**
 * `node` as written, with each bound type parameter replaced by its argument. The spans come from the
 * AST, so a `T` inside a string literal or a property name is left alone; a textual replace would not.
 */
function printWithScope(node, scope, depth = 0) {
	const text = node.getText();
	if (!scope.size || depth > MAX_TYPE_DEPTH) return oneLine(text);
	const base = node.getStart();
	const cuts = [];
	const visit = (child) => {
		if (ts.isTypeReferenceNode(child) && ts.isIdentifier(child.typeName)) {
			const bound = scope.get(child.typeName.text);
			if (bound) {
				cuts.push({
					start: child.getStart(),
					end: child.getEnd(),
					text: printWithScope(bound.node, bound.scope, depth + 1),
				});
				return;
			}
		}
		ts.forEachChild(child, visit);
	};
	visit(node);
	let out = "";
	let at = base;
	for (const cut of cuts.sort((a, b) => a.start - b.start)) {
		out += text.slice(at - base, cut.start - base) + cut.text;
		at = cut.end;
	}
	return oneLine(out + text.slice(at - base));
}

/**
 * Walks a props type as written in source. Our own aliases and interfaces are followed (type arguments bound
 * to their parameters); anything declared outside packages/ui/src is recorded as inherited, as written.
 */
function walkPropsType(node, acc, scope = new Map(), depth = 0) {
	if (!node) return;
	if (depth > MAX_TYPE_DEPTH) {
		acc.warn(
			`props type nested deeper than ${MAX_TYPE_DEPTH}, so "${oneLine(node.getText()).slice(0, 60)}" was not followed`,
		);
		return;
	}
	const walk = (child, childScope = scope) => walkPropsType(child, acc, childScope, depth + 1);
	if (ts.isParenthesizedTypeNode(node)) return walk(node.type);
	if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
		for (const t of node.types) walk(t);
		return;
	}
	if (!ts.isTypeReferenceNode(node) && !ts.isExpressionWithTypeArguments(node)) return;
	const nameNode = ts.isTypeReferenceNode(node) ? node.typeName : node.expression;
	const name = nameNode.getText().split(".").pop();
	const args = node.typeArguments ?? [];
	if (scope.has(name)) {
		const bound = scope.get(name);
		return bound && walk(bound.node, bound.scope);
	}
	if (TRANSPARENT_UTILITIES.has(name)) return walk(args[0]);
	if (name === "VariantProps" && args[0] && ts.isTypeQueryNode(args[0])) {
		for (const [variant, value] of cvaVariants(args[0])) acc.cva.set(variant, value);
		return;
	}
	if (name === "ComponentProps" || name === "ComponentPropsWithoutRef" || name === "ComponentPropsWithRef") {
		const target = args[0];
		if (target && ts.isTypeQueryNode(target)) {
			const { fn, propsTypeNode } = implementationOf(checker.getSymbolAtLocation(target.exprName));
			const local = propsTypeNode ?? fn?.parameters[0]?.type;
			if (fn && isOurs(fn) && local) return walk(local, new Map());
		}
	}
	const symbol = resolveAlias(checker.getSymbolAtLocation(nameNode));
	const decls = symbol?.declarations ?? [];
	if (decls.length && decls.every(isOurs)) {
		for (const decl of decls) {
			const inner = new Map(
				(decl.typeParameters ?? []).map((tp, i) => {
					const arg = args[i] ?? tp.default;
					return [tp.name.text, arg && { node: arg, scope: args[i] ? scope : new Map() }];
				}),
			);
			if (ts.isTypeAliasDeclaration(decl)) walk(decl.type, inner);
			else if (ts.isInterfaceDeclaration(decl)) {
				for (const clause of decl.heritageClauses ?? []) for (const t of clause.types) walk(t, inner);
			}
		}
		return;
	}
	if (!decls.length || symbol.flags & ts.SymbolFlags.TypeParameter) return;
	const bound = new Map([...scope].filter(([, v]) => v));
	acc.inherits.add(printWithScope(node, bound).replace(/\bReact\./g, ""));
}

const unionOfLiterals = (type) =>
	type.isUnion() &&
	type.types.every((t) => t.isStringLiteral() || t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null));

const tidy = (text) =>
	oneLine(text)
		.replace(/\bReact\./g, "")
		.replace(/^\| /, "")
		.replace(/\( /g, "(")
		.replace(/,? \)/g, ")")
		.replace(/;? \}/g, " }")
		.replace(/ \| undefined$/, "")
		.replace(/^undefined \| /, "");

function printType(decl, type, warn) {
	const typeNode = decl && (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) ? decl.type : undefined;
	const text = printCheckedType(typeNode, decl, type, warn);
	const nullable =
		typeNode &&
		ts.isUnionTypeNode(typeNode) &&
		typeNode.types.some((t) => ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword);
	return nullable && !/\bnull\b/.test(text) ? `${text} | null` : text;
}

function printCheckedType(typeNode, decl, type, warn) {
	if (unionOfLiterals(type)) {
		if (typeNode && ts.isUnionTypeNode(typeNode) && typeNode.types.every((t) => ts.isLiteralTypeNode(t)))
			return tidy(typeNode.getText());
		const literals = type.types
			.filter((t) => t.isStringLiteral())
			.map((t) => JSON.stringify(t.value))
			.join(" | ");
		if (literals.length <= MAX_TYPE_LENGTH || !typeNode) return literals;
		warn(`${literals.length} characters of literals shown as "${oneLine(typeNode.getText())}"`);
	}
	if (
		typeNode &&
		(ts.isTypeReferenceNode(typeNode) || ts.isFunctionTypeNode(typeNode) || ts.isParenthesizedTypeNode(typeNode))
	)
		return tidy(typeNode.getText());
	const text = tidy(
		checker.typeToString(
			type,
			decl,
			ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
		),
	);
	if (text.length <= MAX_TYPE_LENGTH || !typeNode) return text;
	warn(`type is ${text.length} characters expanded, shown as "${oneLine(typeNode.getText())}"`);
	return tidy(typeNode.getText());
}

function describe(prop) {
	const description = oneLine(ts.displayPartsToString(prop.getDocumentationComment(checker)));
	const tag = prop.getJsDocTags(checker).find((t) => t.name === "default");
	const jsdocDefault = tag?.text ? oneLine(ts.displayPartsToString(tag.text)) : undefined;
	return { description: description || undefined, jsdocDefault };
}

function propsOf(exported, warn) {
	const symbol = resolveAlias(exported);
	const decl = symbol?.valueDeclaration;
	if (!decl || !/^[A-Z]/.test(exported.name)) return null;
	const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
	const signatures = (type.isUnion() ? type.types : [type]).flatMap((t) => t.getCallSignatures());
	const param = signatures[0]?.getParameters()[0];
	if (!param) return null;
	const propsType = checker.getTypeOfSymbol(param);
	if (!(propsType.flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection | ts.TypeFlags.Union))) return null;

	const { fn, propsTypeNode } = implementationOf(symbol);
	const defaults = destructuredDefaults(fn);
	const acc = { inherits: new Set(), cva: new Map(), warn };
	walkPropsType(propsTypeNode ?? fn?.parameters[0]?.type, acc);

	const members = propsType.isUnion()
		? propsType.types.flatMap((t) => checker.getPropertiesOfType(t))
		: checker.getPropertiesOfType(propsType);
	const byName = new Map();
	for (const member of members) if (!byName.has(member.name)) byName.set(member.name, member);

	const props = [];
	const external = [];
	for (const prop of byName.values()) {
		const decls = prop.declarations ?? [];
		const ownDecl = decls.find(isOurs);
		const fromCva = acc.cva.has(prop.name);
		if (!ownDecl && !fromCva) {
			if (decls.length) external.push(decls[0]);
			continue;
		}
		const type = checker.getTypeOfSymbol(prop);
		const printed = printType(ownDecl, type, (why) => warn(`${prop.name}: ${why}`));
		const required = propsType.isUnion()
			? propsType.types.every((t) => {
					const p = t.getProperty(prop.name);
					return p && !(p.flags & ts.SymbolFlags.Optional);
				})
			: !(prop.flags & ts.SymbolFlags.Optional);
		const trivial = prop.name === "ref" || prop.name === "key" || (!required && TRIVIAL_TYPES.has(printed));
		if (SKIPPED.has(prop.name) && (!ownDecl || trivial)) continue;
		const { description, jsdocDefault } = describe(prop);
		const def = jsdocDefault ?? defaults.get(prop.name) ?? (fromCva ? acc.cva.get(prop.name) : undefined);
		props.push({
			name: prop.name,
			type: printed,
			required,
			...(def !== undefined && { default: def }),
			...(description && { description }),
		});
	}

	if (!acc.inherits.size) {
		for (const d of external) {
			const owner = ts.findAncestor(d, (n) => ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n))?.name.text;
			if (owner && !/^(AriaAttributes|DOMAttributes|Attributes|RefAttributes|ClassAttributes)$/.test(owner))
				acc.inherits.add(owner);
		}
	}
	const sorted = [...props.filter((p) => p.required), ...props.filter((p) => !p.required)];
	return { props: sorted, inherits: [...acc.inherits].sort() };
}

function exportsOf(file) {
	const source = program.getSourceFile(join(UI, "src", file));
	const moduleSymbol = checker.getSymbolAtLocation(source);
	return new Map(checker.getExportsOfModule(moduleSymbol).map((s) => [s.name, s]));
}

const meta = JSON.parse(readFileSync(join(UI, "registry/meta.json"), "utf8"));
const mainExports = exportsOf("index.ts");
const aiExports = exportsOf("ai.ts");
const out = {};
const warnings = [];
let withTables = 0;
for (const { name, category } of meta) {
	const exported = (category === "AI" ? aiExports : mainExports).get(name);
	if (!exported) console.warn(`props: ${name} is not exported from ${category === "AI" ? "ai.ts" : "index.ts"}`);
	out[name] = exported ? propsOf(exported, (why) => warnings.push(`${name}: ${why}`)) : null;
	if (out[name]) withTables++;
}
writeFileSync(join(UI, "registry/props.json"), `${JSON.stringify(out, null, "\t")}\n`);
for (const w of warnings) console.warn(`props: ${w}`);
console.log(
	`props: ${withTables} components with tables, ${meta.length - withTables} null${warnings.length ? `, ${warnings.length} shortened` : ""}`,
);
