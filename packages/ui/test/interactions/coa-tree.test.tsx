import { ChartOfAccountsTree, type CoaTreeNode } from "@cynco-labs/ui";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const NODES: CoaTreeNode[] = [
	{
		id: "1000",
		accountCode: "1000",
		accountName: "Current Assets",
		accountType: "asset",
		isHeaderAccount: true,
		children: [
			{ id: "1000-001", accountCode: "1000-001", accountName: "Maybank Current Account", accountType: "asset", balance: "248315.40" },
			{ id: "1100-000", accountCode: "1100-000", accountName: "Petty Cash", accountType: "asset", balance: "850.00" },
		],
	},
	{
		id: "2000",
		accountCode: "2000",
		accountName: "Current Liabilities",
		accountType: "liability",
		isHeaderAccount: true,
		children: [{ id: "2000-001", accountCode: "2000-001", accountName: "Trade Payables", accountType: "liability", balance: "58320.75" }],
	},
];

/** A row is named by its account, so the name is how a user finds it. */
const row = (name: string) => screen.getByRole("treeitem", { name: new RegExp(name) });
const rows = () => screen.getAllByRole("treeitem");
const missing = (name: string) => screen.queryByRole("treeitem", { name: new RegExp(name) });

describe("ChartOfAccountsTree, moving through the tree", () => {
	test("arrow keys move focus down the visible rows and Home returns to the first", async () => {
		const user = userEvent.setup();
		render(<ChartOfAccountsTree nodes={NODES} defaultExpandedIds={["1000"]} />);

		row("Current Assets").focus();

		await user.keyboard("{ArrowDown}");
		expect(document.activeElement).toBe(row("Maybank Current Account"));

		await user.keyboard("{ArrowDown}");
		expect(document.activeElement).toBe(row("Petty Cash"));

		await user.keyboard("{ArrowUp}");
		expect(document.activeElement).toBe(row("Maybank Current Account"));

		await user.keyboard("{Home}");
		expect(document.activeElement).toBe(row("Current Assets"));
	});

	test("End moves to the last visible row, skipping the children of a collapsed branch", async () => {
		const user = userEvent.setup();
		render(<ChartOfAccountsTree nodes={NODES} defaultExpandedIds={[]} />);

		row("Current Assets").focus();
		await user.keyboard("{End}");

		expect(document.activeElement).toBe(row("Current Liabilities"));
	});

	test("the right arrow opens a branch and the next press moves into it", async () => {
		const user = userEvent.setup();
		render(<ChartOfAccountsTree nodes={NODES} defaultExpandedIds={[]} />);

		row("Current Assets").focus();
		expect(missing("Maybank Current Account")).toBeNull();

		await user.keyboard("{ArrowRight}");
		await waitFor(() => expect(row("Maybank Current Account")).toBeTruthy());
		expect(row("Current Assets").getAttribute("aria-expanded")).toBe("true");

		await user.keyboard("{ArrowRight}");
		expect(document.activeElement).toBe(row("Maybank Current Account"));
	});

	test("the left arrow closes an open branch, then climbs to the parent", async () => {
		const user = userEvent.setup();
		render(<ChartOfAccountsTree nodes={NODES} defaultExpandedIds={["1000"]} />);

		row("Petty Cash").focus();
		await user.keyboard("{ArrowLeft}");
		expect(document.activeElement).toBe(row("Current Assets"));

		await user.keyboard("{ArrowLeft}");
		await waitFor(() => expect(missing("Petty Cash")).toBeNull());
		expect(row("Current Assets").getAttribute("aria-expanded")).toBe("false");
	});

	test("Enter selects the focused row", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(<ChartOfAccountsTree nodes={NODES} defaultExpandedIds={["1000"]} onSelect={onSelect} />);

		row("Petty Cash").focus();
		await user.keyboard("{Enter}");

		await waitFor(() => expect(row("Petty Cash").getAttribute("aria-selected")).toBe("true"));
		expect(onSelect).toHaveBeenCalledWith("1100-000");
	});

	test("Tab reaches the selected row and leaves every other row out of the tab order", async () => {
		const user = userEvent.setup();
		render(
			<>
				<button type="button">Before</button>
				<ChartOfAccountsTree nodes={NODES} defaultExpandedIds={["1000"]} defaultSelectedId="1100-000" />
			</>,
		);

		screen.getByRole("button", { name: "Before" }).focus();
		await user.keyboard("{Tab}");

		expect(document.activeElement).toBe(row("Petty Cash"));
		expect(rows().filter((r) => r.getAttribute("tabindex") === "0")).toHaveLength(1);
	});
});

describe("ChartOfAccountsTree, controlled expansion", () => {
	test("the right arrow reports the branch it would open and leaves the tree as the caller set it", async () => {
		const user = userEvent.setup();
		const onExpandedChange = vi.fn();
		render(<ChartOfAccountsTree nodes={NODES} expandedIds={[]} onExpandedChange={onExpandedChange} />);

		row("Current Assets").focus();
		await user.keyboard("{ArrowRight}");

		expect(onExpandedChange).toHaveBeenCalledWith(["1000"]);
		expect(missing("Maybank Current Account")).toBeNull();
	});

	test("the caller's expandedIds decide which rows are visible", () => {
		render(<ChartOfAccountsTree nodes={NODES} expandedIds={["2000"]} />);

		expect(row("Trade Payables")).toBeTruthy();
		expect(missing("Maybank Current Account")).toBeNull();
	});

	test("closing a branch reports the remaining ids", async () => {
		const user = userEvent.setup();
		const onExpandedChange = vi.fn();
		render(<ChartOfAccountsTree nodes={NODES} expandedIds={["1000", "2000"]} onExpandedChange={onExpandedChange} />);

		row("Current Assets").focus();
		await user.keyboard("{ArrowLeft}");

		expect(onExpandedChange).toHaveBeenCalledWith(["2000"]);
	});
});
