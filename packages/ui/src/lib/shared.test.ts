import { describe, expect, test } from "vitest";
import { formatBracketed, formatCurrency, formatCurrencyCompact, formatCurrencyWhole, formatDate } from "./shared";

// ICU separates the symbol from the figure with a no-break space.
const NB = " ";

describe("formatCurrency", () => {
	test("formats decimal strings exactly, rounding half-up", () => {
		expect(formatCurrency("1234.565")).toBe(`RM${NB}1,234.57`);
		expect(formatCurrency("0.10")).toBe(`RM${NB}0.10`);
	});
	test("formats numbers with the currency's locale", () => {
		expect(formatCurrency(-1234.5)).toBe(`-RM${NB}1,234.50`);
		expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
		expect(formatCurrency(10000, "IDR")).toBe(`Rp${NB}10.000,00`);
		expect(formatCurrency(1234, "JPY")).toBe("￥1,234");
	});
	test("keeps ISO minor units whatever the runtime's currency data says", () => {
		expect(formatCurrency("10000.50", "IDR")).toBe(`Rp${NB}10.000,50`);
		expect(formatCurrencyWhole(10000.5, "IDR")).toBe(`Rp${NB}10.001`);
	});
	test("invalid input prints zero rather than NaN", () => {
		expect(formatCurrency("abc")).toBe(`RM${NB}0.00`);
		expect(formatCurrency("1,234")).toBe(`RM${NB}0.00`);
		expect(formatCurrency(Number.NaN)).toBe(`RM${NB}0.00`);
		expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe(`RM${NB}0.00`);
	});
});

test("formatCurrencyWhole drops the sen", () => {
	expect(formatCurrencyWhole(184500.6)).toBe(`RM${NB}184,501`);
});

test("formatCurrencyCompact keeps at most one decimal", () => {
	expect(formatCurrencyCompact(184500)).toBe(`RM${NB}184.5K`);
	expect(formatCurrencyCompact(208000)).toBe(`RM${NB}208K`);
	expect(formatCurrencyCompact(950)).toBe(`RM${NB}950`);
});

describe("formatBracketed", () => {
	test("zero is a dash, negatives are bracketed", () => {
		expect(formatBracketed(0)).toBe("—");
		expect(formatBracketed(1234567.891)).toBe("1,234,567.89");
		expect(formatBracketed(-1234.5)).toBe("(1,234.50)");
	});
});

describe("formatDate", () => {
	test("reads ISO dates as local calendar dates", () => {
		expect(formatDate("2026-10-29")).toBe("29 Oct 2026");
		expect(formatDate("2026-02")).toBe("1 Feb 2026");
	});
	test("accepts Date objects", () => {
		expect(formatDate(new Date(2026, 0, 5))).toBe("5 Jan 2026");
	});
});
