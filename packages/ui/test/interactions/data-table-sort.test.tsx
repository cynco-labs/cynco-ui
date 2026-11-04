import { DataTable, InvoiceActionsPanel } from "@cynco-labs/ui";
import { getCoreRowModel, getSortedRowModel, type TableOptions, useReactTable } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

type Row = { name: string };
const data: Row[] = [{ name: "Beta" }, { name: "Alpha" }];
const columns = [{ accessorKey: "name", header: "Customer" }];

function Members({ options }: { options: Partial<TableOptions<Row>> }) {
	const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), ...options });
	return (
		<DataTable.Provider config={{ table, numberOfColumns: 1, isLoading: false }}>
			<DataTable.Container>
				<DataTable.Content>
					<DataTable.Header />
					<DataTable.Body />
				</DataTable.Content>
			</DataTable.Container>
		</DataTable.Provider>
	);
}

describe("DataTable headers", () => {
	test("a table that sorts gets sort buttons without a separate flag", async () => {
		const user = userEvent.setup();
		render(<Members options={{ getSortedRowModel: getSortedRowModel() }} />);
		const header = screen.getByRole("columnheader", { name: /Customer/ });
		expect(header.getAttribute("aria-sort")).toBe("none");
		await user.click(screen.getByRole("button", { name: /Customer/ }));
		expect(header.getAttribute("aria-sort")).toBe("ascending");
	});

	test("a table without a sorted row model shows plain headers", () => {
		render(<Members options={{}} />);
		expect(screen.queryByRole("button", { name: /Customer/ })).toBeNull();
	});
});

describe("InvoiceActionsPanel", () => {
	test("a sent invoice can be marked paid and reminded, not emailed again", () => {
		render(<InvoiceActionsPanel status="sent" />);
		expect(screen.getByRole("button", { name: "Mark as paid" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Send reminder" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Send email" })).toBeNull();
	});
});
