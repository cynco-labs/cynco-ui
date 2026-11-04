import { CommandPalette, type CommandPaletteItem } from "@cynco-labs/ui";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const items: CommandPaletteItem[] = [
	{ id: "invoices", group: "Go to", label: "Invoices", keywords: ["sales"] },
	{ id: "journal", group: "Go to", label: "Journal entries" },
	{ id: "new-invoice", group: "Create", label: "New invoice" },
];

const search = () => screen.getByRole("combobox", { name: "Command palette" });
const options = () => screen.queryAllByRole("option");
const labels = () => options().map((o) => o.textContent);
const highlighted = () => options().filter((o) => o.getAttribute("aria-selected") === "true");

/**
 * The option the search box points at, which is what a screen reader reads out as the current
 * choice. It has to be the highlighted option at every moment, the first render included.
 */
function announced() {
	const id = search().getAttribute("aria-activedescendant");
	return id ? options().find((o) => o.id === id) : undefined;
}

describe("CommandPalette", () => {
	test("the search box is a combobox over the list of options", () => {
		render(<CommandPalette inline items={items} />);

		expect(search().getAttribute("aria-expanded")).toBe("true");
		expect(search().getAttribute("aria-controls")).toBe(screen.getByRole("listbox").id);
		expect(labels()).toEqual(["Invoices", "Journal entries", "New invoice"]);
	});

	test("one option is highlighted from the start, so Enter always has a target", () => {
		render(<CommandPalette inline items={items} />);

		expect(highlighted()).toHaveLength(1);
		expect(highlighted()[0]?.textContent).toBe("Invoices");
	});

	test("the search box names that first highlight, so Enter never runs an unannounced option", () => {
		render(<CommandPalette inline items={items} />);

		expect(announced()?.textContent).toBe("Invoices");
		expect(announced()).toBe(highlighted()[0]);
	});

	test("narrowing the list leaves the search box naming a row that is still on screen", async () => {
		const user = userEvent.setup();
		render(<CommandPalette inline items={items} />);

		await user.click(search());
		await user.keyboard("{ArrowDown}");
		await waitFor(() => expect(announced()?.textContent).toBe("Journal entries"));

		await user.keyboard("sales");

		await waitFor(() => expect(labels()).toEqual(["Invoices"]));
		expect(announced()?.textContent).toBe("Invoices");
		expect(announced()).toBe(highlighted()[0]);
	});

	test("the arrows move the highlight and the search box announces where it lands", async () => {
		const user = userEvent.setup();
		render(<CommandPalette inline items={items} />);

		await user.click(search());
		await user.keyboard("{ArrowDown}");

		await waitFor(() => expect(announced()?.textContent).toBe("Journal entries"));
		expect(highlighted()).toHaveLength(1);
		expect(announced()).toBe(highlighted()[0]);
	});

	test("the arrows keep the announced option and the highlight in step", async () => {
		const user = userEvent.setup();
		render(<CommandPalette inline items={items} />);

		await user.click(search());
		await user.keyboard("{ArrowDown}{ArrowDown}");
		await waitFor(() => expect(announced()?.textContent).toBe("New invoice"));

		await user.keyboard("{ArrowUp}");
		await waitFor(() => expect(announced()?.textContent).toBe("Journal entries"));
		expect(announced()).toBe(highlighted()[0]);
	});

	test("Enter runs the highlighted option, not the one the list opened on", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(<CommandPalette inline items={items} onSelect={onSelect} />);

		await user.click(search());
		await user.keyboard("{ArrowDown}{Enter}");

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect.mock.calls[0][0]).toMatchObject({ id: "journal" });
	});

	test("typing narrows the list to what matches a keyword", async () => {
		const user = userEvent.setup();
		render(<CommandPalette inline items={items} />);

		await user.click(search());
		await user.keyboard("sales");

		await waitFor(() => expect(labels()).toEqual(["Invoices"]));
		expect(highlighted()[0]?.textContent).toBe("Invoices");
	});

	test("a query with no match says so, out loud as well as on screen", async () => {
		const user = userEvent.setup();
		render(<CommandPalette inline items={items} />);

		await user.click(search());
		await user.keyboard("zzzz");

		await waitFor(() => expect(options()).toHaveLength(0));
		const live = screen.getByRole("status");
		expect(live.textContent).toContain("No results for");
		expect(within(screen.getByRole("listbox")).getByText(/No results for/)).toBeDefined();
	});

	test("a className and a native prop reach the root of the inline palette", () => {
		render(<CommandPalette inline items={items} className="ring-2" data-testid="palette" />);

		const root = screen.getByTestId("palette");
		expect(root.className).toContain("ring-2");
		expect(root.contains(search())).toBe(true);
	});

	test("a className and a native prop reach the dialog panel", () => {
		render(<CommandPalette open items={items} className="ring-2" data-testid="palette" />);

		const root = screen.getByRole("dialog", { name: "Command palette" });
		expect(root).toBe(screen.getByTestId("palette"));
		expect(root.className).toContain("ring-2");
	});
});
