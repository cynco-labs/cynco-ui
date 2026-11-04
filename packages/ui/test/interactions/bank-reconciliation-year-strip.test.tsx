import { type BankCloseMonth, BankReconciliationYearStrip } from "@cynco-labs/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const months: BankCloseMonth[] = [
	{ period: "2026-01", state: "closed" },
	{ period: "2026-02", state: "ready" },
	{ period: "2026-03", state: "needs_work", openLines: 4 },
];

function Strip(props: Partial<React.ComponentProps<typeof BankReconciliationYearStrip>>) {
	return <BankReconciliationYearStrip months={months} yearLabel="FY 2026" accountName="Maybank Current" {...props} />;
}

const month = (name: string) => screen.getByRole("button", { name: new RegExp(`^${name} 2026`) });
const current = () =>
	screen
		.getAllByRole("button")
		.find((b) => b.getAttribute("aria-current") === "true")
		?.getAttribute("aria-label");

describe("BankReconciliationYearStrip selection", () => {
	test("it works with no selection props at all", async () => {
		const user = userEvent.setup();
		render(<Strip />);

		expect(current()).toBeUndefined();
		await user.click(month("February"));

		expect(current()).toMatch(/^February 2026/);
	});

	test("defaultSelected seeds the selection and the user moves it from there", async () => {
		const user = userEvent.setup();
		const onSelectedChange = vi.fn();
		render(<Strip defaultSelected="2026-02" onSelectedChange={onSelectedChange} />);

		expect(current()).toMatch(/^February 2026/);
		await user.click(month("March"));

		expect(current()).toMatch(/^March 2026/);
		expect(onSelectedChange).toHaveBeenCalledWith("2026-03");
	});

	test("clicking the selected month deselects it", async () => {
		const user = userEvent.setup();
		const onSelectedChange = vi.fn();
		render(<Strip defaultSelected="2026-02" onSelectedChange={onSelectedChange} />);

		await user.click(month("February"));

		expect(current()).toBeUndefined();
		expect(onSelectedChange).toHaveBeenCalledWith(null);
	});

	test("a caller holding selected keeps it, and still hears which month was asked for", async () => {
		const user = userEvent.setup();
		const onSelectedChange = vi.fn();
		render(<Strip selected="2026-01" onSelectedChange={onSelectedChange} />);

		await user.click(month("March"));

		expect(current()).toMatch(/^January 2026/);
		expect(onSelectedChange).toHaveBeenCalledWith("2026-03");
	});
});
