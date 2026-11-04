import { PurchaseOrderLinkedBills } from "@cynco-labs/ui";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const BILLS = [
	{ id: "b1", billNumber: "BILL-2026-0311", status: "paid", totalAmount: "5520.00", issueDate: "2026-10-02" },
	{ id: "b2", billNumber: "BILL-2026-0327", status: "in_review", totalAmount: "1802.00", issueDate: "2026-10-19" },
];

/** Both layouts render under jsdom, so every query is scoped to the table. */
const table = () => within(screen.getByRole("table"));

describe("PurchaseOrderLinkedBills", () => {
	test("opening a bill hands the whole row to onRowClick, not its id", async () => {
		const user = userEvent.setup();
		const onRowClick = vi.fn();
		render(<PurchaseOrderLinkedBills bills={BILLS} onRowClick={onRowClick} />);

		await user.click(table().getByRole("button", { name: "BILL-2026-0327" }));
		expect(onRowClick).toHaveBeenCalledWith(BILLS[1]);
	});

	test("without onRowClick the bill number is plain text rather than a dead control", () => {
		render(<PurchaseOrderLinkedBills bills={BILLS} />);

		expect(table().getByText("BILL-2026-0311").tagName).toBe("SPAN");
		expect(table().queryByRole("button")).toBe(null);
	});

	test("bill status reads from the shared bill vocabulary", () => {
		render(<PurchaseOrderLinkedBills bills={BILLS} />);

		expect(table().getByText("In Review")).toBeTruthy();
	});
});
