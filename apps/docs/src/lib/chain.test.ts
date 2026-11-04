import assert from "node:assert/strict";
import { test } from "node:test";
import { type NavLink, neighboursIn } from "./chain.ts";

const link = (label: string): NavLink => ({ label, href: `/${label.toLowerCase()}` });
const chains = [
	[link("Introduction"), link("Installation"), link("All components")],
	[link("DataList"), link("StatTile")],
	[link("Accordion"), link("Button")],
];

test("previous and next stay inside one chain", () => {
	assert.deepEqual(neighboursIn(chains, "/datalist"), { prev: undefined, next: link("StatTile") });
	assert.deepEqual(neighboursIn(chains, "/stattile"), { prev: link("DataList"), next: undefined });
});

test("the first page of a category does not step back into the one before it", () => {
	assert.equal(neighboursIn(chains, "/accordion").prev, undefined);
	assert.equal(neighboursIn(chains, "/introduction").prev, undefined);
	assert.deepEqual(neighboursIn(chains, "/all components"), { prev: link("Installation"), next: undefined });
});

test("a page in no chain has no neighbours", () => {
	assert.deepEqual(neighboursIn(chains, "/nowhere"), { prev: undefined, next: undefined });
});
