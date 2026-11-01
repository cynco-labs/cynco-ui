import { ReceiptIcon } from "@phosphor-icons/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Button, DataTable, StatusChip } from "@cynco-labs/ui";

const data = [
	{ id: "INV-2026-0142", name: "Nusantara Logistik Bhd", amount: "RM 12,720.00", status: "Paid" },
	{
		id: "INV-2026-0141",
		name: "TechNova Solutions Sdn Bhd",
		amount: "RM 3,180.00",
		status: "Sent",
	},
	{ id: "INV-2026-0140", name: "Kedai Runcit Maju Jaya", amount: "RM 486.50", status: "Overdue" },
];

const tone = { Paid: "green", Sent: "blue", Overdue: "amber" };

const columns = [
	{ accessorKey: "name", header: "Customer" },
	{
		accessorKey: "id",
		header: "Invoice",
		cell: (c) => <span className="text-tiny-id text-tertiary-foreground">{c.getValue()}</span>,
	},
	{ accessorKey: "amount", header: "Amount" },
	{
		accessorKey: "status",
		header: "Status",
		cell: (c) => (
			<StatusChip tone={tone[c.getValue()]} glyph="check">
				{c.getValue()}
			</StatusChip>
		),
	},
];

export default function DataTableDemo() {
	const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
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
			<DataTable.Provider
				config={{ table, numberOfColumns: columns.length, isLoading: false, rowClassName: "h-10" }}
			>
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
