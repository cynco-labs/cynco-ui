import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, test } from "vitest";
import { GeneralLedgerTable, JournalLinesTable } from "./ledger";
import { type PayslipData, PayslipsRunTable } from "./operations";

/**
 * Rule 5 (AGENTS.md): money is a decimal string, and posted totals print as given.
 *
 * A float holds an amount only while it stays small and shallow. The moment a figure runs past
 * float's exact integer range, or carries a third decimal, `parseFloat` / `Number` / `toFixed` print
 * a number nobody posted. The first half of this file scans the accounting sources for those three
 * and fails on any that is not in `EXCEPTIONS`, so the next person adding a money figure cannot
 * reach for a float without saying why. The second half pins the arithmetic the scan cannot see.
 *
 * The components here take props only, so the cases read better as `createElement` than as JSX, and
 * the file stays a `.ts` beside the sources it guards.
 */

/* ------------------------------------------------------------------ the scan */

// Vite reads the sources as text, so the scan needs neither a path relative to the working
// directory nor `@types/node`, which this package does not depend on.
const RAW = import.meta.glob("./**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const SOURCES: Record<string, string> = Object.fromEntries(
	Object.entries(RAW).map(([path, text]) => [path.replace("./", ""), text]),
);
const FORBIDDEN = /\bparseFloat\(|(?<!\.)\bNumber\(|\.toFixed\(/;

/** The module a source belongs to: "banking/feed-list.tsx" and "banking.tsx" are both "banking". */
const moduleOf = (path: string) => path.split("/")[0]!.replace(/\.tsx$/, "");

/** Every source of one module, as one string, so an exception survives the module being split up. */
const moduleText = (name: string) =>
	Object.entries(SOURCES)
		.filter(([path]) => moduleOf(path) === name)
		.map(([, text]) => text)
		.join("\n");

/**
 * Each exception names a line that may keep a float, and why it is not money. A stale entry fails
 * too, so an exception cannot outlive the code it covers. It names the module, not the file, so
 * moving a component between files inside its module does not need an edit here.
 */
type Exception = { module: string; snippet: string; why: string };

// biome-ignore-start lint/suspicious/noTemplateCurlyInString: each snippet quotes a line of source verbatim, so a `${…}` in it is the code being matched, not an unevaluated placeholder.
const EXCEPTIONS: Exception[] = [
	// Geometry: SVG path coordinates in user-space units, not a figure anyone posts.
	{
		module: "banking",
		snippet: "(Number(((sen < 0n ? -sen : sen) * 1000n) / max) / 1000) * 15",
		why: "a sparkline bar's height in viewBox units",
	},
	{
		module: "reports",
		snippet: '`${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`',
		why: "sparkline path coordinates",
	},

	// Percentages, rates and durations: indicators derived from amounts that were themselves exact.
	// Rule 5 governs amounts; a margin is a ratio of two of them and never sums into a posted figure.
	{ module: "operations", snippet: "{pct.toFixed(0)}% paid", why: "share of a bill paid" },
	{ module: "operations", snippet: "(a.usefulLifeMonths / 12).toFixed(1)", why: "useful life in years" },
	{ module: "operations", snippet: "`${m.percent.toFixed(1)}%`", why: "margin percentage" },
	{ module: "operations", snippet: "{realized.marginPercent.toFixed(1)}%", why: "margin percentage" },
	{ module: "operations", snippet: "`${r!.marginPercent!.toFixed(2)}%`", why: "margin percentage" },
	{ module: "operations", snippet: "`${stats.avgProfitMargin.toFixed(2)}%`", why: "average margin percentage" },
	{ module: "parties", snippet: "{m.percent.toFixed(1)}%", why: "margin percentage" },
	{ module: "parties", snippet: "{`${metrics.collectionRate.toFixed(1)}% collected`}", why: "collection rate" },
	{
		module: "parties",
		snippet: "v: Number(m.total)",
		why: "a recharts Bar plots numbers, so the trend total crosses once on its way into the chart",
	},
	{ module: "reports", snippet: "{t.delta.toFixed(1)}%", why: "period-on-period delta percentage" },
	{ module: "reports", snippet: "`${runwayMonths.toFixed(1)} mo`", why: "runway in months" },
	{ module: "sales", snippet: "`${(stats.conversionRate || 0).toFixed(1)}%`", why: "conversion rate" },

	// One ratio helper per file, so each file crosses from an exact amount to a float in exactly one
	// named place. A new ratio reuses the helper instead of earning its own exception.
	{
		module: "operations",
		snippet: "return Number((toSen(part) * 10_000n) / w) / 100;",
		why: "percentOf, behind every progress bar and percentage label in the file",
	},
	{
		module: "reports",
		snippet: "return w === 0n ? 0 : Number((toSen(part) * 1_000_000n) / w) / 1_000_000;",
		why: "ratioOf, behind every arc length, bar width and sparkline point in the file",
	},

	// Counts and quantities: whole things, not amounts. Where one multiplies into money the
	// arithmetic happens in sen (see sales-math.ts), so only the display stays a number.
	{ module: "reports", snippet: "points.slice(-Number(range))", why: "how many points the chart window keeps" },
	{
		module: "sales",
		snippet: "const n = Number(t);",
		why: "parsing a typed quantity, which the guard below rejects unless whole",
	},
	{ module: "sales", snippet: "Number(qtyDraft?.text) >= 1", why: "wording the same quantity guard's message" },
];
// biome-ignore-end lint/suspicious/noTemplateCurlyInString: end of the quoted snippets.

const files = Object.keys(SOURCES);

describe("accounting sources keep money off floats", () => {
	test("the scan sees every accounting module", () => {
		expect([...new Set(files.map(moduleOf))]).toEqual(
			expect.arrayContaining(["banking", "ledger", "operations", "parties", "reports", "sales"]),
		);
	});

	test.each(files)("%s has no unexplained parseFloat, Number() or toFixed", (file) => {
		const allowed = EXCEPTIONS.filter((e) => e.module === moduleOf(file)).map((e) => e.snippet);
		const offenders = SOURCES[file]!.split("\n")
			.map((text, i) => ({ line: i + 1, text }))
			.filter(({ text }) => FORBIDDEN.test(text) && !allowed.some((s) => text.includes(s)))
			.map(({ line, text }) => `${file}:${line}  ${text.trim()}`);
		expect(offenders).toEqual([]);
	});

	test.each(EXCEPTIONS)("exception in $module for $why still matches a line", ({ module, snippet }) => {
		expect(moduleText(module)).toContain(snippet);
	});
});

/* ------------------------------------------------------- the arithmetic itself */

/** The rendered text with runs of whitespace collapsed, so assertions ignore element boundaries. */
function textOf(ui: Parameters<typeof render>[0]): string {
	return render(ui).container.textContent!.replace(/\s+/g, " ");
}

/** The footer's closing-balance line, so a test of it cannot pass on a row's own Balance cell. */
const closingLine = (text: string) => text.slice(text.indexOf("Closing balance"));

const glRow = (id: string, debit: string, credit: string, runningBalance: string) => ({
	id,
	date: "2026-10-01",
	entryNumber: `JV-${id}`,
	description: "Posting",
	debit,
	credit,
	runningBalance,
});

describe("GeneralLedgerTable totals", () => {
	test("sums page debits past float's exact integer range", () => {
		// 99999999999999.99 + 99999999999999.99 is 199999999999999.97 in float, one sen short.
		const rows = [
			glRow("1", "99999999999999.99", "0", "99999999999999.99"),
			glRow("2", "99999999999999.99", "0", "199999999999999.98"),
		];
		expect(textOf(createElement(GeneralLedgerTable, { rows }))).toContain("RM 199,999,999,999,999.98");
	});

	test("rounds each posted line to the sen before adding, half away from zero", () => {
		// Float adds first and rounds once: 1.005 + 2.005 is 3.0100000000000002, printed as 3.01.
		const rows = [glRow("1", "1.005", "0", "1.01"), glRow("2", "2.005", "0", "3.02")];
		expect(textOf(createElement(GeneralLedgerTable, { rows }))).toContain("RM 3.02");
	});

	test("prints the posted closing balance as given rather than the last row's running balance", () => {
		const rows = [glRow("1", "100.00", "0", "900.00")];
		const text = closingLine(textOf(createElement(GeneralLedgerTable, { rows, closingBalance: "1234.50" })));
		expect(text).toContain("RM 1,234.50");
		expect(text).not.toContain("RM 900.00");
	});

	test("falls back to the last row's running balance when no closing balance is given", () => {
		const rows = [glRow("1", "100.00", "0", "900.00")];
		expect(closingLine(textOf(createElement(GeneralLedgerTable, { rows })))).toContain("RM 900.00");
	});

	test("totals the base-currency figures of a foreign line, not its own currency", () => {
		const rows = [{ ...glRow("1", "1000.00", "0", "4280.00"), currency: "USD", baseDebit: "4280.00" }];
		const text = textOf(createElement(GeneralLedgerTable, { rows }));
		expect(text).toContain("RM 4,280.00");
	});
});

describe("JournalLinesTable totals", () => {
	const line = (id: string, debitAmount: string, creditAmount: string) => ({
		id,
		lineNumber: Number(id),
		accountCode: `1${id}00`,
		accountName: "Cash",
		accountType: "asset",
		debitAmount,
		creditAmount,
	});

	test("prints the entry's posted totals as given", () => {
		const lines = [line("1", "500.00", "0"), line("2", "0", "500.00")];
		const text = textOf(createElement(JournalLinesTable, { lines, totalDebit: "9999.99", totalCredit: "9999.99" }));
		expect(text).toContain("RM 9,999.99");
	});

	test("sums the lines exactly when the entry carries no totals", () => {
		const lines = [line("1", "99999999999999.99", "0"), line("2", "99999999999999.99", "0")];
		expect(textOf(createElement(JournalLinesTable, { lines }))).toContain("RM 199,999,999,999,999.98");
	});
});

describe("PayslipsRunTable totals", () => {
	const payslip = (id: string, net: number): PayslipData => ({
		id,
		employeeName: `Employee ${id}`,
		reference: `PS-${id}`,
		gross: net,
		statutoryDeductions: 0,
		otherDeductions: 0,
		net,
		employerCost: net,
		paymentStatus: "paid",
		paymentReference: null,
		lines: [],
		contributions: [],
	});

	test("converts integer sen to ringgit without a float divide", () => {
		// Exact as an integer, but 9007199254740991 / 100 is a sen short as a float.
		const text = textOf(createElement(PayslipsRunTable, { payslips: [payslip("1", Number.MAX_SAFE_INTEGER)] }));
		expect(text).toContain("90,071,992,547,409.91");
		expect(text).not.toContain("90,071,992,547,409.90");
	});

	test("adds the sen before converting, so the run total matches the payslips", () => {
		// Three of these overflow float's exact integer range by one sen on the way up.
		const payslips = [
			payslip("1", 3_002_399_751_580_331),
			payslip("2", 3_002_399_751_580_331),
			payslip("3", 3_002_399_751_580_331),
		];
		const text = textOf(createElement(PayslipsRunTable, { payslips }));
		expect(text).toContain("90,071,992,547,409.93");
	});
});
