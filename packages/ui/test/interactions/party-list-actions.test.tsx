import {
	type CustomerAction,
	CustomerListTable,
	type CyncoCustomerRow,
	type CyncoVendorRow,
	type VendorAction,
	VendorListTable,
} from "@cynco-labs/ui";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const customers: CyncoCustomerRow[] = [{ id: "c1", name: "Bina Jaya Construction" }];
const vendors: CyncoVendorRow[] = [
	{ id: "v1", name: "Tenaga Nasional Berhad" },
	{ id: "v2", name: "Cetak Kilat Printing", isActive: false },
];

/**
 * Open one row's menu and choose an item by the words on it. DataList mounts a table and a
 * stacked layout at once and CSS picks one, so the menu is reached through the table.
 */
async function choose(user: ReturnType<typeof userEvent.setup>, row: string, item: string) {
	await user.click(within(screen.getByRole("table")).getByRole("button", { name: `Actions for ${row}` }));
	await user.click(await screen.findByRole("menuitem", { name: item }));
}

describe("CustomerListTable row actions", () => {
	test("choosing a menu item hands back the row and the action id, not the wording", async () => {
		const user = userEvent.setup();
		const onAction = vi.fn<(row: CyncoCustomerRow, action: CustomerAction) => void>();
		render(<CustomerListTable customers={customers} onAction={onAction} />);

		await choose(user, "Bina Jaya Construction", "Manage contacts");

		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onAction.mock.calls[0][0].id).toBe("c1");
		expect(onAction.mock.calls[0][1]).toBe("manage_contacts");
	});

	test("every item in the menu reports an action", async () => {
		const user = userEvent.setup();
		const onAction = vi.fn<(row: CyncoCustomerRow, action: CustomerAction) => void>();
		render(<CustomerListTable customers={customers} onAction={onAction} />);

		for (const [item, action] of [
			["Edit", "edit"],
			["Delete", "delete"],
		] as const) {
			await choose(user, "Bina Jaya Construction", item);
			expect(onAction).toHaveBeenLastCalledWith(expect.objectContaining({ id: "c1" }), action);
		}
	});
});

describe("VendorListTable row actions", () => {
	test("choosing a menu item hands back the row and the action id", async () => {
		const user = userEvent.setup();
		const onAction = vi.fn<(row: CyncoVendorRow, action: VendorAction) => void>();
		render(<VendorListTable vendors={vendors} onAction={onAction} />);

		await choose(user, "Tenaga Nasional Berhad", "Record payment");

		expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: "v1" }), "record_payment");
	});

	test("an inactive vendor offers Activate, and says so by its id", async () => {
		const user = userEvent.setup();
		const onAction = vi.fn<(row: CyncoVendorRow, action: VendorAction) => void>();
		render(<VendorListTable vendors={vendors} onAction={onAction} />);

		await choose(user, "Tenaga Nasional Berhad", "Deactivate");
		expect(onAction).toHaveBeenLastCalledWith(expect.objectContaining({ id: "v1" }), "deactivate");

		await choose(user, "Cetak Kilat Printing", "Activate");
		expect(onAction).toHaveBeenLastCalledWith(expect.objectContaining({ id: "v2" }), "activate");
	});
});
