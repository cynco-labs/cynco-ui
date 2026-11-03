import { act, renderHook } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { useColumnVisibility } from "./use-column-visibility";

type Row = { a: string; b: string };
const columns: ColumnDef<Row, unknown>[] = [
	{ id: "a", header: "A" },
	{ id: "b", header: "B" },
];
const options = { columns, defaultVisibleColumnIds: ["a", "b"], storageKey: "test" };
const KEY = "cynco-ui:table-columns:test";

afterEach(() => localStorage.clear());

describe("useColumnVisibility", () => {
	test("the server renders the defaults, whatever the browser has saved", () => {
		localStorage.setItem(KEY, JSON.stringify({ b: false }));
		let seen: unknown;
		function Probe() {
			seen = useColumnVisibility(options).columnVisibility;
			return null;
		}
		renderToString(<Probe />);
		expect(seen).toEqual({ a: true, b: true });
	});

	test("the browser shows the saved columns", () => {
		localStorage.setItem(KEY, JSON.stringify({ b: { visible: false, name: "B" } }));
		const { result } = renderHook(() => useColumnVisibility(options));
		expect(result.current.columnVisibility).toEqual({ a: true, b: false });
	});

	test("toggles are unsaved until saved, then persist", () => {
		const { result } = renderHook(() => useColumnVisibility(options));
		act(() => result.current.setColumnVisibility({ a: false, b: true }));
		expect(result.current.isDirty).toBe(true);
		expect(localStorage.getItem(KEY)).toBeNull();
		act(() => result.current.saveColumnVisibility());
		expect(result.current.isDirty).toBe(false);
		expect(result.current.columnVisibility).toEqual({ a: false, b: true });
		expect(JSON.parse(localStorage.getItem(KEY) ?? "{}")).toEqual({ a: { visible: false, name: "A" }, b: { visible: true, name: "B" } });
	});

	test("saving updates other tables in the tab that share the key", () => {
		const first = renderHook(() => useColumnVisibility(options));
		const second = renderHook(() => useColumnVisibility(options));
		act(() => first.result.current.setColumnVisibility({ a: false, b: true }));
		act(() => first.result.current.saveColumnVisibility());
		expect(second.result.current.columnVisibility).toEqual({ a: false, b: true });
	});
});
