# DataTable

Cynco's data-table kit on TanStack Table: toolbar, heading, tray, header, body, virtualisation, pagination and column visibility.

```tsx
import { DataTable } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

A list page whose rows come from a TanStack table: invoices, customers, items. For a list you declare as columns and rows, without a table instance, use `DataList`; for a handful of static rows, use the `Table` primitives.

## Props

A TanStack `table` instance (`useReactTable` + `getCoreRowModel` from `@tanstack/react-table`) passed via `DataTable.Provider config={{table, numberOfColumns, isLoading}}`; compose `Toolbar` › `Heading` + `Actions`, then `Container` › `Content` › `Header` + `Body`, with `Pagination` on the tray or `Footer` inside the table. Optional `onRowClick`, `getRowHref` + `linkComponent`, `enableSelection`, `virtualization`.

## Accessibility

| Key | Does |
| --- | --- |
| Tab | Reaches the first cell of each row, which is a link when getRowHref is set and a button when the row is clickable. |
| Enter / Space | Activate that row target, and run the double-click action when the row has no single-click one. |

Table.Content names the table through aria-label or aria-labelledby, marks it aria-busy while loading, and keeps a polite live region that reports "Loading…", the empty-state text, or the row count. A sortable header is a button inside a th that carries aria-sort, and the caret icons are aria-hidden. The select-all box is labelled "Select all rows" and each row's box is named after that row's first text value so the labels stay distinct, while skeleton rows are aria-hidden.

## Notes

Exported as `DataTable` so it does not clash with the `Table` primitive. `Pagination` pages the table instance by default and a cursor-paged result when you pass `cursor`; `Footer` is the same bar inside the table's own `<tfoot>`. Surfaces use the `table-*` tokens. Set `mobileCards` to swap rows for cards once the table's own container is under 640px.

Category: Components · Data display. Source: `packages/ui/src/base/components/table/index.tsx:18-38`.
