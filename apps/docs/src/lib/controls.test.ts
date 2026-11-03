import assert from "node:assert/strict";
import { test } from "node:test";
import { controlsFromQuery, controlsToQuery, type Controls } from "./controls.ts";

const controls: Controls = {
	layout: { label: "Layout", options: [{ value: "minimal", label: "Minimal" }, { value: "full", label: "Full" }], default: "minimal" },
	loading: { label: "Loading", default: false },
};

test("a playground link round-trips its values and keeps other parameters", () => {
	const query = controlsToQuery(controls, { layout: "full", loading: true }, new URLSearchParams("theme=dark&layout=minimal"));
	assert.equal(query.toString(), "theme=dark&layout=full&loading=1");
	assert.deepEqual(controlsFromQuery(controls, query), { layout: "full", loading: true });
});

test("unknown values and keys in the URL are ignored", () => {
	assert.deepEqual(controlsFromQuery(controls, new URLSearchParams("layout=huge&loading=yes&other=1")), {});
});

test("clearing the overrides removes the controls from the URL", () => {
	assert.equal(controlsToQuery(controls, {}, new URLSearchParams("layout=full&loading=0&x=1")).toString(), "x=1");
});
