import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@cynco-labs/ui";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

function Fixture({ onSelect }: { onSelect?: (value: string) => void }) {
	return (
		<Command label="Commands">
			<CommandInput placeholder="Search commands…" />
			<CommandList>
				<CommandEmpty>No matching command</CommandEmpty>
				<CommandGroup heading="Entries">
					<CommandItem value="new-journal" onSelect={onSelect}>
						New journal entry
					</CommandItem>
					<CommandItem value="new-invoice" onSelect={onSelect}>
						New invoice
					</CommandItem>
				</CommandGroup>
				<CommandGroup heading="Reports">
					<CommandItem value="trial-balance" onSelect={onSelect}>
						Trial balance
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	);
}

const input = () => screen.getByPlaceholderText("Search commands…");
const itemNames = () =>
	screen.queryAllByRole("option").map((o) => o.textContent);
const highlighted = () =>
	screen
		.queryAllByRole("option")
		.find((o) => o.getAttribute("data-selected") === "true");

describe("Command", () => {
	test("every item is listed before anything is typed", () => {
		render(<Fixture />);

		expect(itemNames()).toEqual([
			"New journal entry",
			"New invoice",
			"Trial balance",
		]);
	});

	test("typing filters the list down to matching items", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.click(input());
		await user.keyboard("invoice");

		await waitFor(() => expect(itemNames()).toEqual(["New invoice"]));
	});

	test("clearing the query brings every item back", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.click(input());
		await user.keyboard("invoice");
		await waitFor(() => expect(itemNames()).toEqual(["New invoice"]));

		await user.clear(input());

		await waitFor(() => expect(itemNames()).toHaveLength(3));
	});

	// cmdk keeps an emptied group mounted and marks it `hidden`, so the question is whether
	// the heading is still shown, not whether the node is still there.
	const groupIsShown = (heading: string) =>
		!screen
			.getByText(heading)
			.closest('[data-slot="command-group"]')
			?.hasAttribute("hidden");

	test("a group with no surviving items stops being shown", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		expect(groupIsShown("Reports")).toBe(true);

		await user.click(input());
		await user.keyboard("invoice");

		await waitFor(() => expect(groupIsShown("Reports")).toBe(false));
		expect(groupIsShown("Entries")).toBe(true);
	});

	test("the empty state renders when nothing matches", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		expect(screen.queryByText("No matching command")).toBeNull();

		await user.click(input());
		await user.keyboard("zzzz");

		await waitFor(() =>
			expect(screen.getByText("No matching command")).toBeTruthy(),
		);
		expect(itemNames()).toEqual([]);
	});

	// Focus stays in the input the whole time (that is how you keep typing), so the
	// highlight is carried by aria-activedescendant rather than by DOM focus.
	test("ArrowDown moves the highlight without taking focus off the input", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.click(input());
		expect(highlighted()?.textContent).toBe("New journal entry");

		await user.keyboard("{ArrowDown}");
		await waitFor(() =>
			expect(highlighted()?.textContent).toBe("New invoice"),
		);
		expect(document.activeElement).toBe(input());

		await user.keyboard("{ArrowUp}");
		await waitFor(() =>
			expect(highlighted()?.textContent).toBe("New journal entry"),
		);
	});

	test("Enter selects the highlighted item and reports its value", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(<Fixture onSelect={onSelect} />);

		await user.click(input());
		await user.keyboard("{ArrowDown}{Enter}");

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith("new-invoice");
	});

	test("Enter after filtering selects the item the user can see", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(<Fixture onSelect={onSelect} />);

		await user.click(input());
		await user.keyboard("trial");
		await waitFor(() => expect(itemNames()).toEqual(["Trial balance"]));

		await user.keyboard("{Enter}");

		expect(onSelect).toHaveBeenCalledWith("trial-balance");
	});

	test("Enter with nothing matching selects nothing", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(<Fixture onSelect={onSelect} />);

		await user.click(input());
		await user.keyboard("zzzz");
		await waitFor(() =>
			expect(screen.getByText("No matching command")).toBeTruthy(),
		);

		await user.keyboard("{Enter}");

		expect(onSelect).not.toHaveBeenCalled();
	});

	test("clicking an item selects it", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(<Fixture onSelect={onSelect} />);

		await user.click(screen.getByText("Trial balance"));

		expect(onSelect).toHaveBeenCalledWith("trial-balance");
	});
});
