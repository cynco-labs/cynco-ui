import { type BankFeedDay, BankFeedList } from "@cynco-labs/ui";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const DAYS: BankFeedDay[] = [
	{
		date: "2026-10-29",
		rows: [
			{ id: "t1", date: "2026-10-29", payeeName: "TechNova Solutions", type: "credit", amount: 12720, status: "imported", suggestion: { accountName: "Trade Receivables", confidence: 0.94 } },
			{ id: "t2", date: "2026-10-29", payeeName: "Tenaga Nasional", type: "debit", amount: 1184.3, status: "categorized", category: "6210 Utilities" },
		],
	},
	{
		date: "2026-10-28",
		rows: [
			{ id: "t3", date: "2026-10-28", payeeName: "Lembaga Hasil Dalam Negeri", type: "credit", amount: 3850, status: "categorized", category: "4000 Sales Revenue" },
			{ id: "t4", date: "2026-10-28", payeeName: "Grab Malaysia", type: "debit", amount: 38.5, status: "imported" },
		],
	},
];

/** The transaction rows, in the order they are drawn; the day headers are rows too, and carry no checkbox. */
const rows = () => screen.getAllByRole("row").filter((r) => within(r).queryByRole("checkbox"));

const CELLS = ["select", "detail", "category", "amount"] as const;

const cell = (row: number, name: (typeof CELLS)[number]) => within(rows()[row]!).getAllByRole("gridcell")[CELLS.indexOf(name)]!;

describe("BankFeedList, moving through the feed", () => {
	test("the feed is a single tab stop, and tabbing again leaves it", async () => {
		const user = userEvent.setup();
		render(
			<>
				<BankFeedList days={DAYS} total={4} />
				<button type="button">After</button>
			</>,
		);

		screen.getByLabelText("Status filter").focus();

		await user.tab();
		expect(document.activeElement).toBe(cell(0, "select"));

		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
	});

	test("arrow keys move focus down the feed and Home returns to the first row", async () => {
		const user = userEvent.setup();
		render(<BankFeedList days={DAYS} total={4} />);

		cell(0, "select").focus();

		await user.keyboard("{ArrowDown}");
		expect(document.activeElement).toBe(cell(1, "select"));

		await user.keyboard("{ArrowUp}");
		expect(document.activeElement).toBe(cell(0, "select"));

		await user.keyboard("{ArrowDown}{ArrowDown}{Home}");
		expect(document.activeElement).toBe(cell(0, "select"));
	});

	// The day headings are not items, so the feed reads as one list however many days it spans.
	test("ArrowDown crosses from the last row of a day into the first row of the next", async () => {
		const user = userEvent.setup();
		render(<BankFeedList days={DAYS} total={4} />);

		cell(1, "select").focus();
		await user.keyboard("{ArrowDown}");

		expect(document.activeElement).toBe(cell(2, "select"));
		expect(within(cell(2, "detail")).getByText("Lembaga Hasil Dalam Negeri")).toBeTruthy();
	});

	test("End moves to the last row of the feed", async () => {
		const user = userEvent.setup();
		render(<BankFeedList days={DAYS} total={4} />);

		cell(0, "select").focus();
		await user.keyboard("{End}");

		expect(document.activeElement).toBe(cell(3, "select"));
	});

	test("ArrowRight and ArrowLeft move across the cells of a row", async () => {
		const user = userEvent.setup();
		render(<BankFeedList days={DAYS} total={4} />);

		cell(0, "select").focus();

		for (const name of ["detail", "category", "amount"] as const) {
			await user.keyboard("{ArrowRight}");
			expect(document.activeElement).toBe(cell(0, name));
		}

		await user.keyboard("{ArrowRight}");
		expect(document.activeElement).toBe(cell(0, "amount"));

		await user.keyboard("{ArrowLeft}");
		expect(document.activeElement).toBe(cell(0, "category"));
	});

	test("the column is kept when focus moves to another row", async () => {
		const user = userEvent.setup();
		render(<BankFeedList days={DAYS} total={4} />);

		cell(0, "amount").focus();
		await user.keyboard("{ArrowDown}");

		expect(document.activeElement).toBe(cell(1, "amount"));
	});
});

describe("BankFeedList, ticking rows from the keyboard", () => {
	test("Space on the select cell ticks that row and reports the new selection", async () => {
		const user = userEvent.setup();
		const onSelectionChange = vi.fn();
		render(<BankFeedList days={DAYS} total={4} onSelectionChange={onSelectionChange} />);

		cell(0, "select").focus();
		await user.keyboard(" ");

		await waitFor(() => expect(within(rows()[0]!).getByRole("checkbox").getAttribute("aria-checked")).toBe("true"));
		expect(onSelectionChange).toHaveBeenCalledWith(["t1"]);
		expect(rows()[0]?.getAttribute("aria-selected")).toBe("true");
	});

	test("the tab stop starts on the ticked row rather than the first one", () => {
		render(<BankFeedList days={DAYS} total={4} defaultSelectedIds={["t3"]} />);

		expect(cell(2, "select").getAttribute("tabindex")).toBe("0");
		expect(cell(0, "select").getAttribute("tabindex")).toBe("-1");
	});
});
