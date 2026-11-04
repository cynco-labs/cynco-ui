#!/usr/bin/env node
/**
 * Enforces the class-name rules in AGENTS.md across packages/ui/src.
 *
 *   node scripts/check-classes.mjs [--allow scripts/check-classes.allow] [--quiet]
 *
 * The rules and the scanner live in packages/ui/bin/rules.mjs, which the published `cynco-ui check` runs in
 * apps too; this adds what only the library itself is held to: the pre-token type scale is gone, and viewport
 * breakpoints are banned everywhere except printed documents. Money is guarded by src/accounting/money-rules.test.ts.
 *
 * Justified exceptions go in the allow file, one `path:pattern # reason` per line (format in rules.mjs).
 */
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { check, RULES, sourceFiles } from "../packages/ui/bin/rules.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "packages/ui/src");
const DOCUMENTS = join(SRC, "documents") + sep;
const DEFAULT_ALLOW = join(ROOT, "scripts/check-classes.allow");

/** Type classes from the pre-token scale. Longest first, so `text-main-sec` does not match as `text-main`. */
const LEGACY_TYPE = [
	"giga",
	"main",
	"main-sec",
	"sub",
	"sub-secondary",
	"body",
	"body-highlight",
	"body-secondary",
	"body-sec-paragraph",
	"tiny",
	"tiny-id",
	"checkbox-label",
	"checkbox-descr",
	"checkbox-disabled",
	"form-text",
	"form-label",
	"form-placeholder",
]
	.sort((a, b) => b.length - a.length)
	.join("|");

const LIBRARY_RULES = [
	...RULES.filter((r) => r.in !== "code"),
	{
		id: "legacy-type-class",
		why: "Type classes from the pre-token scale.",
		re: new RegExp(`\\btext-(?:${LEGACY_TYPE})\\b`, "g"),
		in: "string",
	},
];
/** A printed document is laid out against the sheet, so it may use viewport breakpoints. */
const DOCUMENT_RULES = LIBRARY_RULES.filter((r) => r.id !== "breakpoint-prefix");

const args = process.argv.slice(2);
const allowPath = args.includes("--allow") ? resolve(args[args.indexOf("--allow") + 1]) : DEFAULT_ALLOW;

process.exit(
	check({
		files: [...sourceFiles(SRC, [".tsx"])],
		roots: [relative(ROOT, SRC)],
		rel: (file) => relative(ROOT, file),
		rulesFor: (file) => (file.startsWith(DOCUMENTS) ? DOCUMENT_RULES : LIBRARY_RULES),
		allowPath,
		allowLabel: relative(ROOT, allowPath),
		where: "packages/ui/src",
		quiet: args.includes("--quiet"),
	}),
);
