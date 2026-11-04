import { describe, expect, test } from "vitest";
import { highlightCode } from "./code-block";

describe("highlightCode", () => {
	test("leaves the pane colours to the theme and keeps the token colours", async () => {
		const [light, dark] = await highlightCode("const a = 1;\n", "ts");

		for (const html of [light, dark]) {
			const pre = html.slice(0, html.indexOf(">") + 1);
			expect(pre).toMatch(/^<pre/);
			expect(pre).not.toContain("background-color");
			expect(pre).not.toContain("style=");
			expect(html).toContain("<span style=");
		}
		expect(light).not.toEqual(dark);
	});
});
