import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@cynco-labs/ui";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

const PLACEHOLDER = "Pick an account";

/**
 * `items` is how Select learns a value's label; without it the trigger prints the raw value
 * (Base UI's behaviour, which this package inherits). The library's own demos pass it, so the
 * fixture does too — see "without items" below for what a caller who forgets it gets.
 */
const ITEMS = [
	{ label: "Cash", value: "cash" },
	{ label: "Bank", value: "bank" },
	{ label: "Debtors", value: "debtors" },
];

function Fixture(props: {
	value?: string | null;
	defaultValue?: string;
	onValueChange?: (value: string | null) => void;
}) {
	return (
		<Select items={ITEMS} {...props}>
			<SelectTrigger aria-label="Account">
				<SelectValue placeholder={PLACEHOLDER} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="cash">Cash</SelectItem>
				<SelectItem value="bank">Bank</SelectItem>
				<SelectItem value="debtors">Debtors</SelectItem>
			</SelectContent>
		</Select>
	);
}

const trigger = () => screen.getByRole("combobox", { name: "Account" });
const option = (name: string) => screen.getByRole("option", { name });

describe("Select", () => {
	test("a click opens the list", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		expect(screen.queryByRole("listbox")).toBeNull();

		await user.click(trigger());

		expect(await screen.findByRole("listbox")).toBeTruthy();
		expect(trigger().getAttribute("aria-expanded")).toBe("true");
	});

	test("ArrowDown on the trigger opens the list", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.tab();
		expect(document.activeElement).toBe(trigger());

		await user.keyboard("{ArrowDown}");

		expect(await screen.findByRole("listbox")).toBeTruthy();
	});

	// Base UI moves real DOM focus onto the highlighted option, so "what is highlighted"
	// and "what is focused" are the same question.
	test("arrow keys move the highlight through the options", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.tab();
		await user.keyboard("{ArrowDown}");
		await screen.findByRole("listbox");
		expect(document.activeElement).toBe(option("Cash"));

		await user.keyboard("{ArrowDown}");
		expect(document.activeElement).toBe(option("Bank"));

		await user.keyboard("{ArrowDown}");
		expect(document.activeElement).toBe(option("Debtors"));

		await user.keyboard("{ArrowUp}");
		expect(document.activeElement).toBe(option("Bank"));
	});

	test("Enter selects the highlighted option and reports it", async () => {
		const user = userEvent.setup();
		const onValueChange = vi.fn();
		render(<Fixture onValueChange={onValueChange} />);

		await user.tab();
		await user.keyboard("{ArrowDown}");
		await screen.findByRole("listbox");
		await user.keyboard("{ArrowDown}{Enter}");

		expect(onValueChange.mock.calls[0]?.[0]).toBe("bank");
		await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
		expect(trigger().textContent).toContain("Bank");
	});

	test("Escape closes the list and puts focus back on the trigger", async () => {
		const user = userEvent.setup();
		const onValueChange = vi.fn();
		render(<Fixture onValueChange={onValueChange} />);

		await user.tab();
		await user.keyboard("{ArrowDown}");
		await screen.findByRole("listbox");
		await user.keyboard("{ArrowDown}");

		await user.keyboard("{Escape}");

		await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
		expect(document.activeElement).toBe(trigger());
		expect(onValueChange).not.toHaveBeenCalled();
		expect(trigger().textContent).toContain(PLACEHOLDER);
	});

	// `value={null}` is how a caller clears the selection while staying controlled; it must
	// read as "nothing chosen", not as a blank trigger the user cannot interpret.
	test("a controlled value of null shows the placeholder", () => {
		render(<Fixture value={null} />);

		expect(trigger().textContent).toContain(PLACEHOLDER);
	});

	test("a controlled value shows that option and swaps when the value does", () => {
		const { rerender } = render(<Fixture value="cash" />);
		expect(trigger().textContent).toContain("Cash");

		rerender(<Fixture value="debtors" />);
		expect(trigger().textContent).toContain("Debtors");

		rerender(<Fixture value={null} />);
		expect(trigger().textContent).toContain(PLACEHOLDER);
	});

	test("a controlled Select the parent drives round-trips through onValueChange", async () => {
		const user = userEvent.setup();

		function Controlled() {
			const [value, setValue] = React.useState<string | null>(null);
			return <Fixture value={value} onValueChange={setValue} />;
		}
		render(<Controlled />);

		await user.click(trigger());
		await user.click(await screen.findByRole("option", { name: "Debtors" }));

		await waitFor(() => expect(trigger().textContent).toContain("Debtors"));
	});

	// A caller who writes the labels only as SelectItem children gets the raw value on the
	// trigger. Pinned so the day Select starts reading its children instead, this test says so.
	test("without `items` the trigger falls back to the raw value", async () => {
		const user = userEvent.setup();
		render(
			<Select>
				<SelectTrigger aria-label="Account">
					<SelectValue placeholder={PLACEHOLDER} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="bank">Bank</SelectItem>
				</SelectContent>
			</Select>,
		);

		await user.click(trigger());
		await user.click(await screen.findByRole("option", { name: "Bank" }));

		await waitFor(() => expect(trigger().textContent).toContain("bank"));
	});

	test("typing a letter jumps to the matching option", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.tab();
		await user.keyboard("{ArrowDown}");
		await screen.findByRole("listbox");
		expect(document.activeElement).toBe(option("Cash"));

		await user.keyboard("d");

		await waitFor(() => expect(document.activeElement).toBe(option("Debtors")));
	});

	test("the open list is the one place keyboard focus is", async () => {
		const user = userEvent.setup();
		render(
			<>
				<Fixture />
				<button type="button">After</button>
			</>,
		);

		await user.click(trigger());
		const listbox = await screen.findByRole("listbox");

		await waitFor(() =>
			expect(listbox.contains(document.activeElement)).toBe(true),
		);
		expect(document.activeElement).not.toBe(
			screen.getByRole("button", { name: "After" }),
		);
	});
});
