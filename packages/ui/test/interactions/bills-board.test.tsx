import { BillsBoard, type BillsBoardColumn, type CyncoBill } from "@cynco-labs/ui";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const BILLS: CyncoBill[] = [
	{ id: "b1", vendorName: "Grand Office Supplies", billNumber: "GOS-55102", totalAmount: "612.30", status: "in_review" },
	{
		id: "b2",
		vendorName: "Petronas Dagangan Bhd",
		billNumber: "PDB-FLT-88213",
		totalAmount: "2318.45",
		status: "in_review",
	},
	{
		id: "b3",
		vendorName: "Kenanga Legal Chambers",
		billNumber: "KLC-2026-047",
		totalAmount: "5800.00",
		status: "in_review",
	},
	{
		id: "b4",
		vendorName: "Tenaga Nasional Berhad",
		billNumber: "TNB-220415887",
		totalAmount: "1284.60",
		status: "awaiting_payment",
	},
];

function Fixture(props: {
	bills?: CyncoBill[];
	columns?: BillsBoardColumn[];
	defaultSelectedIds?: string[];
	onSelectionChange?: (ids: string[]) => void;
}) {
	return (
		<BillsBoard
			bills={props.bills ?? BILLS}
			columns={props.columns ?? ["in_review"]}
			defaultSelectedIds={props.defaultSelectedIds}
			onSelectionChange={props.onSelectionChange}
		/>
	);
}

const column = (name: string) => within(screen.getByRole("grid", { name })).getAllByRole("row");
const inReview = () => column("In Review bills");

describe("BillsBoard keyboard", () => {
	test("arrow keys move focus down a column and Home returns to the first card", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const [first, second, third] = inReview();
		first?.focus();

		await user.keyboard("{ArrowDown}");
		expect(document.activeElement).toBe(second);

		await user.keyboard("{ArrowDown}");
		expect(document.activeElement).toBe(third);

		await user.keyboard("{Home}");
		expect(document.activeElement).toBe(first);
	});

	test("ArrowUp moves back up and End jumps to the last card", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const [first, second, third] = inReview();
		first?.focus();

		await user.keyboard("{End}");
		expect(document.activeElement).toBe(third);

		await user.keyboard("{ArrowUp}");
		expect(document.activeElement).toBe(second);
	});

	test("focus stays on the first card at the top and the last card at the bottom", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const [first, , third] = inReview();
		first?.focus();

		await user.keyboard("{ArrowUp}");
		expect(document.activeElement).toBe(first);

		await user.keyboard("{End}{ArrowDown}");
		expect(document.activeElement).toBe(third);
	});

	// Roving focus: Tab reaches the column once, at the card the arrows left it on.
	test("only the card focus last left is in the tab order", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const [first, second, third] = inReview();
		expect(first?.getAttribute("tabindex")).toBe("0");

		first?.focus();
		await user.keyboard("{ArrowDown}");

		expect(second?.getAttribute("tabindex")).toBe("0");
		expect(first?.getAttribute("tabindex")).toBe("-1");
		expect(third?.getAttribute("tabindex")).toBe("-1");
	});

	test("Space ticks the focused card and reports the whole selection", async () => {
		const user = userEvent.setup();
		const onSelectionChange = vi.fn();
		render(<Fixture onSelectionChange={onSelectionChange} />);

		const [first, second] = inReview();
		first?.focus();
		await user.keyboard("{ArrowDown} ");

		expect(onSelectionChange).toHaveBeenCalledWith(["b2"]);
		expect(second?.getAttribute("aria-selected")).toBe("true");
		expect(first?.getAttribute("aria-selected")).toBe("false");
	});

	test("Space on a ticked card unticks it", async () => {
		const user = userEvent.setup();
		const onSelectionChange = vi.fn();
		render(<Fixture defaultSelectedIds={["b1"]} onSelectionChange={onSelectionChange} />);

		const [first] = inReview();
		expect(first?.getAttribute("aria-selected")).toBe("true");

		first?.focus();
		await user.keyboard(" ");

		expect(onSelectionChange).toHaveBeenCalledWith([]);
		expect(first?.getAttribute("aria-selected")).toBe("false");
	});

	test("each column is its own grid, so the arrow keys never cross into the next one", async () => {
		const user = userEvent.setup();
		render(<Fixture columns={["in_review", "awaiting_payment"]} />);

		const [, , third] = inReview();
		const [awaiting] = column("Awaiting Payment bills");

		third?.focus();
		await user.keyboard("{ArrowDown}");

		expect(document.activeElement).toBe(third);
		expect(document.activeElement).not.toBe(awaiting);
	});

	test("an empty column offers no grid and no cards to focus", () => {
		render(<Fixture bills={[]} />);

		expect(screen.queryByRole("grid")).toBeNull();
		expect(screen.getByText("No bills to review")).toBeTruthy();
	});
});
