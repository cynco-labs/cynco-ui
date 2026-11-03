import assert from "node:assert/strict";
import { test } from "node:test";
import { ACCENTS, ACCENT_ORDER, type Hex, customAccent, fillsDark, fillsLight, readsDark, themeCss } from "./theme.ts";

test("every preset passes contrast on both themes", () => {
	for (const name of ACCENT_ORDER) {
		const c = ACCENTS[name];
		assert.ok(fillsLight(c.light), `${name} light fill`);
		assert.ok(fillsDark(c.dark), `${name} dark fill`);
		assert.ok(readsDark(c.darkText), `${name} dark text`);
	}
});

test("custom colours are moved only as far as contrast needs", () => {
	const samples: Hex[] = ["#ffff00", "#00ff00", "#ff00ff", "#000000", "#ffffff", "#0a2540", "#7dd3fc", "#635bff"];
	for (const hex of samples) {
		const c = customAccent(hex);
		assert.ok(fillsLight(c.light), `${hex} light ${c.light}`);
		assert.ok(fillsDark(c.dark), `${hex} dark ${c.dark}`);
		assert.ok(readsDark(c.darkText), `${hex} text ${c.darkText}`);
	}
	assert.equal(customAccent("#0b7970").adjusted, false);
	assert.equal(customAccent("#ffff00").adjusted, true);
});

test("defaults write no CSS", () => {
	assert.equal(themeCss({ accent: "blue", radius: "default" }), "");
});

test("an accent overrides primary wherever the theme sets it, a radius only on the root", () => {
	const css = themeCss({ accent: "green", radius: "round" });
	const blocks = css.split("\n}\n").map((b) => b.split(" {\n"));
	assert.deepEqual(
		blocks.map(([selector]) => selector.split(",\n")),
		[[":root", ".light:not(.react-flow)", '[data-theme="light"]', ".preset-modern", '[data-theme="modern"]'], [".dark:not(.react-flow)", '[data-theme$="dark"]'], [":root"]],
	);
	assert.equal(blocks[0][1], "\t--primary: #117c39;");
	assert.equal(blocks[1][1], "\t--primary: #12823b;\n\t--primary-text: #4ade80;");
	assert.match(blocks[2][1], /^\t--radius: 10px;\n[\s\S]*--radius-2xl: 18px;\n\}$/);
});
