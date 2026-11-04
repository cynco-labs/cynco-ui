import { SavedViewsBar, type SavedView, type SavedViewFilter } from "@cynco-labs/ui";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const overdue: SavedViewFilter = { id: "f1", field: "status", label: "Status", value: "Overdue" };
const thisMonth: SavedViewFilter = { id: "f2", field: "period", label: "Period", value: "This month" };

const views: SavedView[] = [
	{ id: "all", name: "All invoices", filters: [], count: 128, locked: true },
	{ id: "late", name: "Overdue", filters: [overdue], count: 7 },
];

const tab = (name: string | RegExp) => screen.getByRole("button", { name });
const chips = () => screen.queryAllByRole("button", { name: /^Remove / });

describe("SavedViewsBar", () => {
	test("the views are one group of pressable tabs, with the first one pressed", () => {
		render(<SavedViewsBar defaultViews={views} />);

		const group = screen.getByRole("group", { name: "Saved views" });
		expect(group).toBeDefined();
		expect(tab(/^All invoices/).getAttribute("aria-pressed")).toBe("true");
		expect(tab(/^Overdue/).getAttribute("aria-pressed")).toBe("false");
	});

	test("choosing a view applies its filters and reports the change", async () => {
		const user = userEvent.setup();
		const onActiveViewChange = vi.fn();
		const onFiltersChange = vi.fn();
		render(<SavedViewsBar defaultViews={views} onActiveViewChange={onActiveViewChange} onFiltersChange={onFiltersChange} />);

		await user.click(tab(/^Overdue/));

		expect(onActiveViewChange).toHaveBeenCalledWith("late");
		expect(onFiltersChange).toHaveBeenCalledWith([overdue]);
		expect(chips()).toHaveLength(1);
	});

	test("the arrow keys walk the tabs, and only the current one is a tab stop", async () => {
		const user = userEvent.setup();
		render(<SavedViewsBar defaultViews={views} />);

		tab(/^All invoices/).focus();
		expect(tab(/^Overdue/).getAttribute("tabindex")).toBe("-1");

		await user.keyboard("{ArrowRight}");
		await waitFor(() => expect(document.activeElement).toBe(tab(/^Overdue/)));

		await user.keyboard("{Home}");
		await waitFor(() => expect(document.activeElement).toBe(tab(/^All invoices/)));
	});

	test("removing a filter marks the view modified and offers Reset", async () => {
		const user = userEvent.setup();
		render(<SavedViewsBar defaultViews={views} defaultActiveViewId="late" />);

		expect(screen.queryByRole("group", { name: "Unsaved view changes" })).toBeNull();

		await user.click(chips()[0]);

		expect(chips()).toHaveLength(0);
		expect(screen.getByRole("group", { name: "Unsaved view changes" })).toBeDefined();
		expect(screen.getByRole("status").textContent).toContain("has unsaved changes");
	});

	test("Reset puts the view's own filters back and clears the modified state", async () => {
		const user = userEvent.setup();
		render(<SavedViewsBar defaultViews={views} defaultActiveViewId="late" />);

		await user.click(chips()[0]);
		await user.click(screen.getByRole("button", { name: "Reset" }));

		expect(chips()).toHaveLength(1);
		await waitFor(() => expect(screen.queryByRole("group", { name: "Unsaved view changes" })).toBeNull());
	});

	test("Save view writes the current filters back to the view it is on", async () => {
		const user = userEvent.setup();
		const onViewsChange = vi.fn();
		render(
			<SavedViewsBar
				defaultViews={views}
				defaultActiveViewId="late"
				defaultFilters={[overdue, thisMonth]}
				onViewsChange={onViewsChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Save view" }));

		expect(onViewsChange).toHaveBeenCalledTimes(1);
		const saved: SavedView[] = onViewsChange.mock.calls[0][0];
		expect(saved.find((v) => v.id === "late")?.filters).toEqual([overdue, thisMonth]);
	});

	test("a locked view cannot be overwritten, only saved as a new one", () => {
		render(<SavedViewsBar defaultViews={views} defaultActiveViewId="all" defaultFilters={[overdue]} />);

		expect(screen.queryByRole("button", { name: "Save view" })).toBeNull();
		expect(screen.getByRole("button", { name: "Save as new" })).toBeDefined();
	});

	test("saving as new names the view and makes it the current one", async () => {
		const user = userEvent.setup();
		const onViewsChange = vi.fn();
		render(
			<SavedViewsBar defaultViews={views} defaultActiveViewId="all" defaultFilters={[overdue]} onViewsChange={onViewsChange} />,
		);

		await user.click(screen.getByRole("button", { name: "Save as new" }));
		await user.type(await screen.findByRole("textbox"), "Chasing");
		await user.click(screen.getByRole("button", { name: /^Save/ }));

		await waitFor(() => expect(onViewsChange).toHaveBeenCalled());
		const saved: SavedView[] = onViewsChange.mock.calls.at(-1)?.[0];
		expect(saved.at(-1)).toMatchObject({ name: "Chasing", filters: [overdue] });
	});

	test("an empty name is refused rather than saved", async () => {
		const user = userEvent.setup();
		const onViewsChange = vi.fn();
		render(<SavedViewsBar defaultViews={views} onViewsChange={onViewsChange} />);

		await user.click(screen.getByRole("button", { name: "New view from current filters" }));
		await user.click(await screen.findByRole("button", { name: /^Save/ }));

		expect(onViewsChange).not.toHaveBeenCalled();
		expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true");
	});
});
