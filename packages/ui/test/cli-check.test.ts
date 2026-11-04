import { describe, expect, it } from "vitest";
import { APP_RULES, RULES, violations } from "../bin/rules.mjs";

const hits = (src: string, rules = APP_RULES) => violations("a.tsx", src, rules).map((v) => `${v.line}:${v.rule}:${v.match}`);

describe("cynco-ui check rules", () => {
	it("flags class names that bypass the theme, the type scale or the cascade", () => {
		expect(
			hits('<div className={cn("text-gray-500 px-2! transition-all", "text-[13px]")} />\n<i className="bg-[#ff0000]" />'),
		).toEqual([
			"2:hex-colour:#ff0000",
			"1:palette-colour:text-gray-500",
			"1:arbitrary-type-size:text-[13px]",
			"1:important-utility:px-2!",
			"1:transition-all:transition-all",
		]);
	});

	it("reads a hex as a colour only inside a class context", () => {
		expect(hits('const id = "#123"; <a href="#abc" style={{ color: "#fff" }} />')).toEqual([]);
		expect(hits('<p className="fill-[var(--chart-series-1)] #fff" />')).toEqual(["1:hex-colour:#fff"]);
	});

	it("flags floats on amounts, not on every number", () => {
		const src = [
			"const a = parseFloat(row.amount);",
			"const t = Number(invoice.total) + 1;",
			"const p = Number(searchParams.get('page'));",
			"const w = Number.isFinite(x);",
			"label = sum.toFixed(2);",
			"pct.toFixed(1);",
			"// Number(total) in a comment",
			"/* parseFloat(price) */",
		].join("\n");
		expect(hits(src).map((h) => h.split(":").slice(0, 2).join(":"))).toEqual([
			"1:float-money",
			"2:float-money",
			"5:float-money",
		]);
	});

	it("flags a size container on a box that shrinks to its content", () => {
		expect(hits('<div className="@container relative w-fit p-3" />')).toEqual([
			"1:container-shrink:@container relative w-fit p-3",
		]);
		expect(hits('<div className="@container relative w-full p-3" /><b className="w-fit" />')).toEqual([]);
		expect(hits('<div className="@container/card inline-flex" />')).toEqual([
			"1:container-shrink:@container/card inline-flex",
		]);
		expect(hits("const ROOT = `@container relative\n\tw-fit p-3`;").map((h) => h.split(":").slice(0, 2).join(":"))).toEqual(
			["1:container-shrink"],
		);
	});

	it("leaves viewport breakpoints to an app's page layout, but not to the library", () => {
		const src = '<main className="md:grid-cols-2 @md:grid-cols-3" />';
		expect(hits(src)).toEqual([]);
		expect(hits(src, RULES)).toEqual(["1:breakpoint-prefix:md:"]);
	});
});
