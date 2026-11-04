import { DataList, type DataColumn } from "@cynco-labs/ui";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

type Entry = { id: string; ref: string; account: string; amount: string };

const ROWS: Entry[] = [
	{ id: "1", ref: "JE-0001", account: "Cash", amount: "1200.00" },
	{ id: "2", ref: "JE-0002", account: "Bank", amount: "450.50" },
	{ id: "3", ref: "JE-0003", account: "Debtors", amount: "90.00" },
];

const columns = (
	sortDirection?: DataColumn<Entry>["sortDirection"],
): DataColumn<Entry>[] => [
	{ key: "ref", header: "Reference", cell: (r) => r.ref, sortDirection },
	{ key: "account", header: "Account", cell: (r) => r.account },
	{ key: "amount", header: "Amount", align: "right", cell: (r) => r.amount },
];

function Fixture(props: {
	onRowClick?: (row: Entry) => void;
	onMenu?: (row: Entry) => void;
	rows?: Entry[];
	totals?: { label?: string } & Record<string, string>;
	empty?: string;
	sortDirection?: DataColumn<Entry>["sortDirection"];
}) {
	const { onRowClick, onMenu, rows = ROWS, totals, empty, sortDirection } = props;
	return (
		<DataList<Entry>
			columns={columns(sortDirection)}
			rows={rows}
			getKey={(r) => r.id}
			caption="Journal entries"
			onRowClick={onRowClick}
			totals={totals}
			empty={empty}
			trailing={
				onMenu
					? (r) => (
							<button type="button" onClick={() => onMenu(r)}>
								{`Actions for ${r.ref}`}
							</button>
						)
					: undefined
			}
		/>
	);
}

/**
 * Both layouts are always mounted; CSS container queries decide which one is shown, and
 * jsdom applies no CSS. Every query is scoped to one layout so a hit in the other can
 * never stand in for the one under test.
 */
const table = () => screen.getByRole("table");
const stacked = () => screen.getByRole("list", { name: "Journal entries" });

describe("DataList, table layout", () => {
	test("renders a row per record under the column headers", () => {
		render(<Fixture />);

		const headers = within(table())
			.getAllByRole("columnheader")
			.map((h) => h.textContent);
		expect(headers).toEqual(["Reference", "Account", "Amount"]);
		expect(within(table()).getAllByRole("row")).toHaveLength(ROWS.length + 1);
	});

	test("without onRowClick the primary cell is plain text, not a control", () => {
		render(<Fixture />);

		expect(within(table()).queryAllByRole("button")).toHaveLength(0);
		expect(within(table()).getByText("JE-0001")).toBeTruthy();
	});

	// A clickable row is not itself the focus stop; the primary cell becomes a real button
	// so the row is reachable with Tab and announced as actionable.
	test("with onRowClick the primary cell is a button reachable by Tab", async () => {
		const user = userEvent.setup();
		render(<Fixture onRowClick={() => {}} />);

		const buttons = within(table()).getAllByRole("button");
		expect(buttons.map((b) => b.textContent)).toEqual([
			"JE-0001",
			"JE-0002",
			"JE-0003",
		]);

		await user.tab();
		expect(document.activeElement).toBe(buttons[0]);

		await user.tab();
		expect(document.activeElement).toBe(buttons[1]);
	});

	test("Enter on a row button opens that row", async () => {
		const user = userEvent.setup();
		const onRowClick = vi.fn();
		render(<Fixture onRowClick={onRowClick} />);

		await user.tab();
		await user.tab();
		await user.keyboard("{Enter}");

		expect(onRowClick).toHaveBeenCalledTimes(1);
		expect(onRowClick).toHaveBeenCalledWith(ROWS[1]);
	});

	test("Space on a row button opens that row", async () => {
		const user = userEvent.setup();
		const onRowClick = vi.fn();
		render(<Fixture onRowClick={onRowClick} />);

		await user.tab();
		await user.keyboard(" ");

		expect(onRowClick).toHaveBeenCalledWith(ROWS[0]);
	});

	test("clicking anywhere else on the row opens it too", async () => {
		const user = userEvent.setup();
		const onRowClick = vi.fn();
		render(<Fixture onRowClick={onRowClick} />);

		await user.click(within(table()).getByText("Debtors"));

		expect(onRowClick).toHaveBeenCalledWith(ROWS[2]);
	});

	// The row-wide click is a mouse shortcut, not a catch-all: a control inside the row acts
	// on its own, or a row menu would open the row every time someone reached for it.
	test("clicking a control inside the row does not open the row", async () => {
		const user = userEvent.setup();
		const onRowClick = vi.fn();
		const onMenu = vi.fn();
		render(<Fixture onRowClick={onRowClick} onMenu={onMenu} />);

		await user.click(
			within(table()).getByRole("button", { name: "Actions for JE-0002" }),
		);

		expect(onMenu).toHaveBeenCalledWith(ROWS[1]);
		expect(onRowClick).not.toHaveBeenCalled();
	});

	test("the sorted column announces its direction and the others stay silent", () => {
		render(<Fixture sortDirection="descending" />);

		const [ref, account, amount] = within(table()).getAllByRole("columnheader");
		expect(ref?.getAttribute("aria-sort")).toBe("descending");
		expect(account?.getAttribute("aria-sort")).toBeNull();
		expect(amount?.getAttribute("aria-sort")).toBeNull();
	});

	test("no column announces a sort when none is set", () => {
		render(<Fixture />);

		for (const header of within(table()).getAllByRole("columnheader")) {
			expect(header.getAttribute("aria-sort")).toBeNull();
		}
	});

	// In a tfoot the totals are a table footer, which assistive tech reads as the summary
	// of the column rather than as one more record.
	test("totals render in the table footer, column-aligned", () => {
		render(<Fixture totals={{ label: "Total", amount: "1740.50" }} />);

		const foot = table().querySelector("tfoot");
		expect(foot).not.toBeNull();

		const cells = within(foot as HTMLElement)
			.getAllByRole("cell")
			.map((c) => c.textContent);
		expect(cells).toEqual(["Total", "", "1740.50"]);
	});

	test("no totals means no table footer", () => {
		render(<Fixture />);

		expect(table().querySelector("tfoot")).toBeNull();
	});

	test("the empty state replaces the rows when there are none", () => {
		render(<Fixture rows={[]} empty="No entries for this period" />);

		expect(within(table()).queryAllByRole("row")).toHaveLength(1);
		expect(
			screen.getAllByText("No entries for this period").length,
		).toBeGreaterThan(0);
	});

	test("the empty state is left out when rows exist", () => {
		render(<Fixture empty="No entries for this period" />);

		expect(screen.queryByText("No entries for this period")).toBeNull();
	});
});

describe("DataList, stacked layout", () => {
	test("the title of a clickable row is a button that opens it", async () => {
		const user = userEvent.setup();
		const onRowClick = vi.fn();
		render(<Fixture onRowClick={onRowClick} />);

		const title = within(stacked()).getByRole("button", { name: "JE-0003" });
		title.focus();
		await user.keyboard("{Enter}");

		expect(onRowClick).toHaveBeenCalledWith(ROWS[2]);
	});

	test("a control inside a stacked row acts on its own", async () => {
		const user = userEvent.setup();
		const onRowClick = vi.fn();
		const onMenu = vi.fn();
		render(<Fixture onRowClick={onRowClick} onMenu={onMenu} />);

		await user.click(
			within(stacked()).getByRole("button", { name: "Actions for JE-0001" }),
		);

		await waitFor(() => expect(onMenu).toHaveBeenCalledWith(ROWS[0]));
		expect(onRowClick).not.toHaveBeenCalled();
	});

	test("the empty state renders in the stacked layout too", () => {
		render(<Fixture rows={[]} empty="No entries for this period" />);

		expect(
			within(stacked()).getByText("No entries for this period"),
		).toBeTruthy();
	});
});
