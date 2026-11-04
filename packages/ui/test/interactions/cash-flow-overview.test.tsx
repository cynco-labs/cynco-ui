import { CashFlowOverview, type CashFlowPoint } from "@cynco-labs/ui";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const POINTS: CashFlowPoint[] = [
	{ label: "May", credits: "61200.00", debits: "48700.00", net: "12500.00" },
	{ label: "Jun", credits: "58400.00", debits: "62100.00", net: "-3700.00" },
	{ label: "Jul", credits: "66900.00", debits: "51300.00", net: "15600.00" },
	{ label: "Aug", credits: "72300.00", debits: "58800.00", net: "13500.00" },
	{ label: "Sep", credits: "69150.00", debits: "60400.00", net: "8750.00" },
	{ label: "Oct", credits: "74800.00", debits: "55900.00", net: "18900.00" },
];

/** The months the chart currently reports, read off the table that carries the same figures. */
const months = () =>
	within(screen.getByRole("table", { name: "Money movement by month (MYR)" }))
		.getAllByRole("rowheader")
		.map((cell) => cell.textContent);

describe("CashFlowOverview range", () => {
	test("choosing 3M narrows the months the chart reports to the last three", async () => {
		const user = userEvent.setup();
		render(<CashFlowOverview points={POINTS} />);

		expect(months()).toEqual(["May", "Jun", "Jul", "Aug", "Sep", "Oct"]);

		await user.click(screen.getByRole("button", { name: "3M" }));

		expect(months()).toEqual(["Aug", "Sep", "Oct"]);
		expect(screen.getByRole("button", { name: "3M", pressed: true })).toBeTruthy();
	});

	test("defaultRange opens on the range it names and still switches", async () => {
		const user = userEvent.setup();
		render(<CashFlowOverview points={POINTS} defaultRange="3" />);

		expect(months()).toEqual(["Aug", "Sep", "Oct"]);

		await user.click(screen.getByRole("button", { name: "6M" }));

		expect(months()).toEqual(["May", "Jun", "Jul", "Aug", "Sep", "Oct"]);
	});

	test("a controlled range reports the choice and changes only when the caller says so", async () => {
		const user = userEvent.setup();
		const onRangeChange = vi.fn();
		const { rerender } = render(<CashFlowOverview points={POINTS} range="6" onRangeChange={onRangeChange} />);

		await user.click(screen.getByRole("button", { name: "3M" }));

		expect(onRangeChange).toHaveBeenCalledWith("3");
		expect(months()).toEqual(["May", "Jun", "Jul", "Aug", "Sep", "Oct"]);

		rerender(<CashFlowOverview points={POINTS} range="3" onRangeChange={onRangeChange} />);

		expect(months()).toEqual(["Aug", "Sep", "Oct"]);
	});
});
