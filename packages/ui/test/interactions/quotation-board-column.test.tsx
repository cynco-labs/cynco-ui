import { QuotationBoardColumn, type SalesQuotation } from "@cynco-labs/ui";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const QUOTATIONS: SalesQuotation[] = [
	{
		id: "q1",
		quotationNumber: "QT-0001",
		customerName: "Syarikat Maju Jaya Sdn Bhd",
		totalAmount: "18600.00",
		status: "sent",
		createdAt: "2026-10-27",
	},
	{
		id: "q2",
		quotationNumber: "QT-0002",
		customerName: "Tropika Kopi Enterprise",
		totalAmount: "4280.00",
		status: "viewed",
		createdAt: "2026-10-29",
	},
	{
		id: "q3",
		quotationNumber: "QT-0003",
		customerName: "Nusantara Logistik Bhd",
		totalAmount: "52000.00",
		status: "sent",
		createdAt: "2026-10-12",
	},
];

function Fixture(props: {
	onRowClick?: (quotation: SalesQuotation) => void;
	quotations?: SalesQuotation[];
}) {
	return (
		<QuotationBoardColumn
			column="active"
			now="2026-10-30"
			quotations={props.quotations ?? QUOTATIONS}
			onRowClick={props.onRowClick}
		/>
	);
}

const cards = () =>
	within(screen.getByRole("listbox", { name: "Sent / Viewed" })).getAllByRole(
		"option",
	);

describe("QuotationBoardColumn keyboard", () => {
	test("arrow keys move focus down the column and Home returns to the first card", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const [first, second, third] = cards();
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

		const [first, second, third] = cards();
		first?.focus();

		await user.keyboard("{End}");
		expect(document.activeElement).toBe(third);

		await user.keyboard("{ArrowUp}");
		expect(document.activeElement).toBe(second);
	});

	test("focus stays on the first card at the top and the last card at the bottom", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const [first, , third] = cards();
		first?.focus();

		await user.keyboard("{ArrowUp}");
		expect(document.activeElement).toBe(first);

		await user.keyboard("{End}{ArrowDown}");
		expect(document.activeElement).toBe(third);
	});

	// Roving focus: the column is one tab stop, so Tab past it never walks every card.
	test("Tab reaches the column once and lands on the card last focused", async () => {
		const user = userEvent.setup();
		render(<Fixture />);

		const [first, second] = cards();
		await user.tab();
		expect(document.activeElement).toBe(first);

		await user.keyboard("{ArrowDown}");
		expect(document.activeElement).toBe(second);

		await user.tab({ shift: true });
		await user.tab();
		expect(document.activeElement).toBe(second);
	});

	test("Enter on the focused card opens that quotation", async () => {
		const user = userEvent.setup();
		const onRowClick = vi.fn();
		render(<Fixture onRowClick={onRowClick} />);

		cards()[0]?.focus();
		await user.keyboard("{ArrowDown}{Enter}");

		expect(onRowClick).toHaveBeenCalledWith(QUOTATIONS[1]);
	});

	test("an empty column offers no listbox and no cards to focus", () => {
		render(<Fixture quotations={[]} />);

		expect(screen.queryByRole("listbox")).toBeNull();
		expect(screen.getByText("No active quotations")).toBeTruthy();
	});
});
