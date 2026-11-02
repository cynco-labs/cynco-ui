import { describe, expect, test } from "vitest";
import { fromSen, isDecimalString, parseAmount, sumAmounts, toSen } from "./money";

describe("toSen", () => {
	test.each<[string | number | bigint | null | undefined, bigint]>([
		["1234.5", 123450n],
		[1234.5, 123450n],
		["1,234.50", 123450n],
		["-0.01", -1n],
		["0.005", 1n],
		["-0.005", -1n],
		["0.004", 0n],
		[".5", 50n],
		["12.", 1200n],
		["", 0n],
		[null, 0n],
		[undefined, 0n],
		["abc", 0n],
		[5n, 5n],
	])("%s → %s", (input, sen) => {
		expect(toSen(input)).toBe(sen);
	});
});

describe("fromSen", () => {
	test.each<[bigint, string]>([
		[123450n, "1234.50"],
		[100n, "1.00"],
		[0n, "0.00"],
		[-5n, "-0.05"],
		[-123456n, "-1234.56"],
	])("%s → %s", (sen, text) => {
		expect(fromSen(sen)).toBe(text);
	});
});

describe("sumAmounts", () => {
	test("adds decimal strings without float drift", () => {
		expect(sumAmounts(["0.10", "0.20"])).toBe("0.30");
		expect(sumAmounts([0.1, 0.2])).toBe("0.30");
	});
	test("ignores empty values and keeps the sign", () => {
		expect(sumAmounts(["100", null, undefined, "", "-50.25"])).toBe("49.75");
	});
	test("empty list is zero", () => {
		expect(sumAmounts([])).toBe("0.00");
	});
});

describe("parseAmount", () => {
	test("empty input is a valid empty value", () => {
		expect(parseAmount("")).toEqual({ ok: true, value: "", isExpression: false });
		expect(parseAmount("   ")).toEqual({ ok: true, value: "", isExpression: false });
	});

	test.each<[string, string, boolean]>([
		["1,234.50", "1234.50", false],
		["1234", "1234.00", false],
		["RM 1,200", "1200.00", false],
		["rm1200.5", "1200.50", false],
		["1 234.50", "1234.50", false],
		["-500", "-500.00", false],
		["(500)", "-500.00", false],
		["(1.2k)", "-1200.00", false],
		["1.2k", "1200.00", false],
		["2.5M", "2500000.00", false],
		["1.005", "1.01", false],
		["=1200*1.08", "1296.00", true],
		["1200*1.08", "1296.00", true],
		["1200x1.08", "1296.00", true],
		["1200×1.08", "1296.00", true],
		["100+250.50-20", "330.50", true],
		["(100+50)/3", "50.00", true],
		["10/3", "3.33", true],
		["2/3", "0.67", true],
		["-(100)", "-100.00", true],
		["1k+500", "1500.00", true],
	])("%s → %s", (input, value, isExpression) => {
		expect(parseAmount(input)).toEqual({ ok: true, value, isExpression });
	});

	test.each<[string, RegExp]>([
		["12%", /unexpected/i],
		["abc", /unexpected/i],
		["1/0", /divide by zero/i],
		["(1+2", /missing/i],
		["1+", /incomplete/i],
	])("%s is rejected", (input, message) => {
		const r = parseAmount(input);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toMatch(message);
	});
});

describe("isDecimalString", () => {
	test.each<[string, boolean]>([
		["1234.50", true],
		["-1", true],
		["0", true],
		["1,234", false],
		["1e3", false],
		[".5", false],
		["", false],
		["RM 1", false],
	])("%s → %s", (input, ok) => {
		expect(isDecimalString(input)).toBe(ok);
	});
});
