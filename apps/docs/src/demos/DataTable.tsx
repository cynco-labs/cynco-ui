import { Button, DataTable, StatusChip } from "@cynco-labs/ui";
import { ReceiptIcon } from "@phosphor-icons/react";
import { type CellContext, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";

const tone = { Paid: "green", Sent: "blue", Overdue: "amber" } as const;

type Row = { id: string; name: string; amount: string; status: keyof typeof tone };

const data: Row[] = [
	{ id: "INV-2026-0142", name: "Nusantara Logistik Bhd", amount: "RM 12,720.00", status: "Paid" },
	{
		id: "INV-2026-0141",
		name: "TechNova Solutions Sdn Bhd",
		amount: "RM 3,180.00",
		status: "Sent",
	},
	{ id: "INV-2026-0140", name: "Kedai Runcit Maju Jaya", amount: "RM 486.50", status: "Overdue" },
];

const columns = [
	{ accessorKey: "name", header: "Customer" },
	{
		accessorKey: "id",
		header: "Invoice",
		cell: (c: CellContext<Row, string>) => (
			<span className="font-mono text-2xs font-medium text-tertiary-foreground">{c.getValue()}</span>
		),
	},
	// Formatted strings sort as text, so this column opts out.
	{ accessorKey: "amount", header: "Amount", enableSorting: false },
	{
		accessorKey: "status",
		header: "Status",
		cell: (c: CellContext<Row, Row["status"]>) => (
			<StatusChip tone={tone[c.getValue()]} glyph="check">
				{c.getValue()}
			</StatusChip>
		),
	},
];

export default function DataTableDemo() {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		// A sorted row model is what turns the headers into sort buttons.
		getSortedRowModel: getSortedRowModel(),
	});
	return (
		<div>
			<DataTable.Toolbar>
				<div className="flex w-full justify-between items-center">
					<DataTable.Heading>
						<ReceiptIcon size={16} weight="fill" className="text-subtle" />
						Invoices
					</DataTable.Heading>
					<DataTable.Actions>
						<Button variant="primary">Create invoice</Button>
					</DataTable.Actions>
				</div>
			</DataTable.Toolbar>
			<DataTable.Provider config={{ table, numberOfColumns: columns.length, isLoading: false, rowClassName: "h-10" }}>
				<DataTable.Container>
					<DataTable.Content>
						<DataTable.Header />
						<DataTable.Body />
					</DataTable.Content>
				</DataTable.Container>
			</DataTable.Provider>
		</div>
	);
}
