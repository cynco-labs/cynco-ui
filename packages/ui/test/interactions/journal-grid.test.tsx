import { JournalGrid, type JournalGridAccount } from "@cynco-labs/ui";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

const ACCOUNTS: JournalGridAccount[] = [
	{ id: "a1", code: "1000", name: "Cash at bank", type: "asset" },
	{ id: "a2", code: "4000", name: "Sales", type: "income" },
	{ id: "a3", code: "5000", name: "Rent expense", type: "expense" },
];

function Fixture(props: { minLines?: number }) {
	return (
		<JournalGrid
			accounts={ACCOUNTS}
			showShortcuts={false}
			minLines={props.minLines}
		/>
	);
}

/** The grid's cells are the four inputs per line, each named "Line N <column>". */
const cell = (line: number, col: "account" | "description" | "debit" | "credit") =>
	screen.getByLabelText(`Line ${line} ${col}`);

const lineCount = () =>
	screen.getAllByRole("group", { name: /^Line \d+$/ }).length;

const balance = () =>
	within(screen.getByRole("group", { name: "Journal lines" }).parentElement!)
		.queryByText(/No amounts yet|Balanced|Out by/)
		?.textContent;

/** Type a figure into an amount cell and commit it, the way Enter or a move does. */
const enterAmount = async (
	user: ReturnType<typeof userEvent.setup>,
	line: number,
	col: "debit" | "credit",
	amount: string,
) => {
	await user.click(cell(line, col));
	await user.keyboard(amount);
	await user.keyboard("{Tab}");
};

describe("JournalGrid, moving between cells", () => {
	test("starts with two blank lines", () => {
		render(<Fixture />);

		expect(lineCount()).toBe(2);
		expect(cell(1, "account")).toBeTruthy();
		expect(cell(2, "credit")).toBeTruthy();
	});

	test("Tab walks Account, Description, Debit, Credit, then wraps to the next line", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		cell(1, "account").focus();

		for (const col of ["description", "debit", "credit"] as const) {
			await user.keyboard("{Tab}");
			expect(document.activeElement).toBe(cell(1, col));
		}

		await user.keyboard("{Tab}");
		expect(document.activeElement).toBe(cell(2, "account"));
	});

	test("Shift+Tab walks back and wraps to the previous line's last cell", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		cell(2, "account").focus();

		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(document.activeElement).toBe(cell(1, "credit"));

		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(document.activeElement).toBe(cell(1, "debit"));
	});

	// Past the first and last cell Tab leaves the cells, so the grid is never a keyboard
	// trap: it carries on into the page rather than wrapping back to the first line.
	test("Tab past the last cell carries on out of the grid", async () => {
		const user = userEvent.setup();
		render(
			<>
				<Fixture />
				<button type="button">After</button>
			</>,
		);

		cell(2, "credit").focus();

		await user.keyboard("{Tab}");
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: /Add line/ }),
		);

		await user.keyboard("{Tab}");
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "After" }),
		);
	});

	test("Shift+Tab before the first cell leaves the grid the other way", async () => {
		const user = userEvent.setup();
		render(
			<>
				<button type="button">Before</button>
				<Fixture />
			</>,
		);

		cell(1, "account").focus();
		await user.keyboard("{Shift>}{Tab}{/Shift}");

		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Before" }),
		);
	});

	test("Enter moves down the same column", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		cell(1, "description").focus();
		await user.keyboard("{Enter}");

		expect(document.activeElement).toBe(cell(2, "description"));
	});

	test("Arrow up and down move between lines in the same column", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		cell(1, "debit").focus();
		await user.keyboard("{ArrowDown}");
		expect(document.activeElement).toBe(cell(2, "debit"));

		await user.keyboard("{ArrowUp}");
		expect(document.activeElement).toBe(cell(1, "debit"));
	});

	test("Arrow up on the first line stays put", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		cell(1, "credit").focus();
		await user.keyboard("{ArrowUp}");

		expect(document.activeElement).toBe(cell(1, "credit"));
	});
});

describe("JournalGrid, adding and deleting lines", () => {
	test("Enter on the last line adds one and focuses its account cell", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		cell(2, "description").focus();
		await user.keyboard("{Enter}");

		await waitFor(() => expect(lineCount()).toBe(3));
		expect(document.activeElement).toBe(cell(3, "account"));
	});

	test("mod+Enter adds a line without reaching the end first", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		cell(1, "description").focus();
		await user.keyboard("{Control>}{Enter}{/Control}");

		await waitFor(() => expect(lineCount()).toBe(3));
		expect(document.activeElement).toBe(cell(2, "account"));
	});

	test("the Add line button adds one at the end", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.click(screen.getByRole("button", { name: /Add line/ }));

		await waitFor(() => expect(lineCount()).toBe(3));
	});

	test("mod+Backspace deletes the line once there are more than the minimum", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.click(screen.getByRole("button", { name: /Add line/ }));
		await waitFor(() => expect(lineCount()).toBe(3));

		cell(2, "description").focus();
		await user.keyboard("{Control>}{Backspace}{/Control}");

		await waitFor(() => expect(lineCount()).toBe(2));
	});

	// Double entry needs at least two lines, so deleting the second one clears it instead of
	// leaving an entry that cannot balance.
	test("mod+Backspace at the minimum clears the line instead of deleting it", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.type(cell(2, "description"), "Rent for June");
		expect((cell(2, "description") as HTMLInputElement).value).toBe(
			"Rent for June",
		);

		cell(2, "description").focus();
		await user.keyboard("{Control>}{Backspace}{/Control}");

		expect(lineCount()).toBe(2);
		await waitFor(() =>
			expect((cell(2, "description") as HTMLInputElement).value).toBe(""),
		);
	});

	test("the per-line delete button is labelled Clear at the minimum and Delete above it", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		expect(screen.getAllByRole("button", { name: "Clear line 2" }).length).toBeGreaterThan(0);

		await user.click(screen.getByRole("button", { name: /Add line/ }));
		await waitFor(() => expect(lineCount()).toBe(3));

		expect(screen.getAllByRole("button", { name: "Delete line 2" }).length).toBeGreaterThan(0);
	});

	test("the per-line delete button removes that line", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await user.click(screen.getByRole("button", { name: /Add line/ }));
		await waitFor(() => expect(lineCount()).toBe(3));

		await user.type(cell(3, "description"), "Third");
		const [del] = screen.getAllByRole("button", { name: "Delete line 1" });
		await user.click(del as HTMLElement);

		await waitFor(() => expect(lineCount()).toBe(2));
	});
});

describe("JournalGrid, the balance indicator", () => {
	test("says nothing has been entered yet", () => {
		render(<Fixture />);

		expect(balance()).toBe("No amounts yet");
	});

	test("reports the difference while debit and credit disagree", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await enterAmount(user, 1, "debit", "1200");

		await waitFor(() => expect(balance()).toMatch(/^Out by/));
		expect(balance()).toContain("1,200.00");
	});

	test("reports the remaining difference, not the whole figure", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await enterAmount(user, 1, "debit", "1200");
		await enterAmount(user, 2, "credit", "900");

		await waitFor(() => expect(balance()).toMatch(/^Out by/));
		expect(balance()).toContain("300.00");
	});

	test("says Balanced once the two sides agree", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await enterAmount(user, 1, "debit", "1200");
		await enterAmount(user, 2, "credit", "1200");

		await waitFor(() => expect(balance()).toBe("Balanced"));
	});

	test("the Dr and Cr totals follow the lines", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await enterAmount(user, 1, "debit", "1200");
		await enterAmount(user, 2, "credit", "450.50");

		await waitFor(() => expect(screen.getByText("Total Dr")).toBeTruthy());
		const total = (label: string) =>
			screen.getByText(label).parentElement?.textContent;
		expect(total("Total Dr")).toContain("1,200.00");
		expect(total("Total Cr")).toContain("450.50");
	});

	test("a figure typed into Debit clears the Credit on the same line", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await enterAmount(user, 1, "credit", "500");
		await waitFor(() =>
			expect((cell(1, "credit") as HTMLInputElement).value).toContain("500"),
		);

		await enterAmount(user, 1, "debit", "800");

		await waitFor(() =>
			expect((cell(1, "credit") as HTMLInputElement).value).toBe(""),
		);
		expect((cell(1, "debit") as HTMLInputElement).value).toContain("800");
	});

	// A negative on one side is the other side: typing -500 into Debit is a 500 Credit.
	test("a negative figure moves to the other side", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await enterAmount(user, 1, "debit", "-500");

		await waitFor(() =>
			expect((cell(1, "credit") as HTMLInputElement).value).toContain("500"),
		);
		expect((cell(1, "debit") as HTMLInputElement).value).toBe("");
	});

	test("Alt+B fills the figure that balances the entry", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		await enterAmount(user, 1, "debit", "1200");

		cell(2, "credit").focus();
		await user.keyboard("{Alt>}b{/Alt}");

		await waitFor(() => expect(balance()).toBe("Balanced"));
		// Alt+B leaves the cell focused, and a focused amount cell shows the raw figure;
		// the thousands separator appears once it blurs.
		expect((cell(2, "credit") as HTMLInputElement).value).toBe("1200.00");

		cell(1, "debit").focus();
		await waitFor(() =>
			expect((cell(2, "credit") as HTMLInputElement).value).toBe("1,200.00"),
		);
	});
});
