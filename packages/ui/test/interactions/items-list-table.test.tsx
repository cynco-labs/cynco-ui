import { type CatalogItem, ItemsListTable } from "@cynco-labs/ui";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";

const ITEMS: CatalogItem[] = [
	{ id: "i1", name: "Kopi O Kaw 1kg", unitPrice: "48.00" },
	{ id: "i2", name: "Cold brew bottle 250ml", unitPrice: "3.20" },
	{ id: "i3", name: "Barista training", unitPrice: "850.00" },
];

/**
 * Both layouts are in the DOM under jsdom, which does not evaluate the container
 * queries that hide one of them, so every query is scoped to the table.
 */
const tick = (label: string) => within(screen.getByRole("table")).getByLabelText(label);
const isTicked = (label: string) => tick(label).getAttribute("aria-checked") === "true";

function Controlled({ onSelectionChange }: { onSelectionChange: (ids: string[]) => void }) {
	const [selected, setSelected] = useState<string[]>([]);
	return (
		<ItemsListTable
			items={ITEMS}
			selectedIds={selected}
			onSelectionChange={(ids) => {
				setSelected(ids);
				onSelectionChange(ids);
			}}
		/>
	);
}

describe("ItemsListTable selection", () => {
	test("ticking a row reports the whole new selection", async () => {
		const user = userEvent.setup();
		const onSelectionChange = vi.fn();
		render(<Controlled onSelectionChange={onSelectionChange} />);

		await user.click(tick("Select Kopi O Kaw 1kg"));
		expect(onSelectionChange).toHaveBeenLastCalledWith(["i1"]);

		await user.click(tick("Select Barista training"));
		expect(onSelectionChange).toHaveBeenLastCalledWith(["i1", "i3"]);

		await user.click(tick("Select Kopi O Kaw 1kg"));
		expect(onSelectionChange).toHaveBeenLastCalledWith(["i3"]);
	});

	test("the header checkbox selects every item, then clears the selection", async () => {
		const user = userEvent.setup();
		const onSelectionChange = vi.fn();
		render(<Controlled onSelectionChange={onSelectionChange} />);

		await user.click(tick("Select all items"));
		expect(onSelectionChange).toHaveBeenLastCalledWith(["i1", "i2", "i3"]);
		expect(isTicked("Select all items")).toBe(true);

		await user.click(tick("Select all items"));
		expect(onSelectionChange).toHaveBeenLastCalledWith([]);
		expect(isTicked("Select all items")).toBe(false);
	});

	test("defaultSelectedIds ticks those rows and the list keeps ticking without a controlling prop", async () => {
		const user = userEvent.setup();
		render(<ItemsListTable items={ITEMS} defaultSelectedIds={["i2"]} />);

		expect(isTicked("Select Cold brew bottle 250ml")).toBe(true);
		expect(isTicked("Select Kopi O Kaw 1kg")).toBe(false);

		await user.click(tick("Select Kopi O Kaw 1kg"));
		expect(isTicked("Select Kopi O Kaw 1kg")).toBe(true);
		expect(isTicked("Select Cold brew bottle 250ml")).toBe(true);
	});
});
