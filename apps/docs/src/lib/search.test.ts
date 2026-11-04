import assert from "node:assert/strict";
import { test } from "node:test";
import { matchIn, type SearchDoc, scoreDoc, search, words } from "./search.ts";

const doc = (title: string, over: Partial<SearchDoc> = {}): SearchDoc => ({
	id: title,
	kind: "component",
	title,
	href: `/components/${title.toLowerCase()}`,
	group: "Components",
	hint: "Components",
	terms: [],
	text: "",
	...over,
});

const docs: SearchDoc[] = [
	doc("Button", { terms: ["Components", "Forms"], text: "A button. Use ButtonGroup for a row of them." }),
	doc("ButtonGroup", { terms: ["Components", "Forms"], text: "A row of related buttons." }),
	doc("GeneralLedgerTable", { terms: ["Accounting", "Ledger"], text: "Every posted line for an account." }),
	doc("DataList", { terms: ["Layout", "Primitives"], text: "The one way to show rows of records." }),
	doc("GroupedTabButton", { terms: ["Components", "Actions"], text: "A tab in a grouped row of buttons." }),
	doc("Installation", {
		kind: "guide",
		title: "Installation",
		href: "/installation",
		group: "Getting started",
		hint: "Guide",
		terms: ["Tailwind", "Fonts", "Providers"],
		text: "Install the package and set up Tailwind.",
	}),
];

const titles = (query: string) => search(query, docs).map((h) => h.doc.title);

test("an exact name wins over the same word in another component's prose", () => {
	assert.deepEqual(titles("button"), ["Button", "ButtonGroup", "GroupedTabButton"]);
});

test("every query word must match, and camel case splits into words", () => {
	assert.deepEqual(titles("button group"), ["ButtonGroup", "GroupedTabButton", "Button"]);
	assert.deepEqual(titles("button zzzz"), []);
});

test("an acronym finds a multi-word name", () => {
	assert.equal(titles("glt")[0], "GeneralLedgerTable");
});

test("a word in the body text matches, ranked below a name match", () => {
	const hits = search("records", docs);
	assert.deepEqual(
		hits.map((h) => h.doc.title),
		["DataList"],
	);
	assert.ok(hits[0].score < scoreDoc("datalist", docs[3]));
});

test("a guide is found by one of its headings", () => {
	assert.deepEqual(titles("tailwind"), ["Installation"]);
});

test("an empty query keeps every document in index order", () => {
	assert.deepEqual(
		titles(""),
		docs.map((d) => d.title),
	);
	assert.equal(search("", docs, 2).length, 2);
});

test("letters scattered through a summary are not a match, but a real word is", () => {
	assert.deepEqual(titles("jrnl"), []);
	assert.deepEqual(titles("records"), ["DataList"]);
});

test("matchIn grades a field by how directly it matches", () => {
	assert.ok(matchIn("button", "Button") > matchIn("button", "ButtonGroup"));
	assert.ok(matchIn("button", "ButtonGroup") > matchIn("group", "ButtonGroup"));
	assert.equal(matchIn("zzz", "ButtonGroup"), 0);
});

test("words splits camel case, punctuation and digits", () => {
	assert.deepEqual(words("GeneralLedgerTable"), ["general", "ledger", "table"]);
	assert.deepEqual(words("Profit & loss, v2"), ["profit", "loss", "v2"]);
});
