# InvoiceListTable

The invoices list: Invoice #, Customer, Date, Due Date, Amount and Status, with row selection, sort headers and per-row actions.

```tsx
import { InvoiceListTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { InvoiceListTable, type SalesInvoiceRow } from "@cynco-labs/ui";
import { useState } from "react";

export default function InvoiceListTableDemo() {
	const rows: SalesInvoiceRow[] = [
		{
			id: "1",
			invoiceNumber: "INV-2026-0142",
			customerName: "Syarikat Maju Jaya Sdn Bhd",
			invoiceDate: "2026-10-28",
			dueDate: "2026-11-27",
			total: "12850.00",
			status: "finalized",
			journalEntryId: "je1",
			emailStatus: "opened",
		},
		{
			id: "3",
			invoiceNumber: "INV-2026-0140",
			customerName: "Tropika Kopi Enterprise",
			invoiceDate: "2026-10-02",
			dueDate: "2026-10-16",
			total: "3240.00",
			status: "overdue",
			journalEntryId: "je3",
			emailStatus: "bounced",
		},
		{
			id: "4",
			invoiceNumber: "INV-2026-0139",
			customerName: "Nusantara Logistik Bhd",
			invoiceDate: "2026-09-30",
			dueDate: "2026-10-30",
			total: "28400.00",
			status: "partially_paid",
			journalEntryId: null,
		},
	];
	const [sel, setSel] = useState(["3", "4"]);
	return (
		<InvoiceListTable
			onRowAction={() => {}}
			invoices={rows}
			selectedIds={sel}
			onSelectionChange={setSel}
			sortField="invoice_date"
			sortDirection="desc"
		/>
	);
}
```

## Use

The Invoicing page's main list, above which InvoiceBulkBar appears once rows are ticked.

## Props

invoices (invoiceNumber, customerName, invoiceDate, dueDate, total, currency, status, journalEntryId, emailStatus), selectedIds, defaultSelectedIds, onSelectionChange, sortField, sortDirection, onSort, optional footer; className.

- `invoices`: `SalesInvoiceRow[]`
- `selectedIds?`: `string[]`. The ticked rows. Pass it to control the selection.
- `defaultSelectedIds?`: `string[]`. The rows ticked to begin with when the selection is uncontrolled.
- `onSelectionChange?`: `(ids: string[]) => void`. The whole new selection, every time it changes.
- `sortField?`: `string`. Default `"invoice_date"`.
- `sortDirection?`: `"asc" | "desc"`. Default `"desc"`.
- `onSort?`: `(field: string) => void`
- `onRowAction?`: `(invoice: SalesInvoiceRow) => void`. Called from a row's actions button; omit to hide the button.
- `footer?`: `ReactNode`
- Also accepts `ComponentProps<"div">`.

## Notes

Invoice numbers use `font-mono text-2xs` in primary and amounts are right-aligned tabular-nums. Responsive: Built on DataList: a tray table from 48rem of container width, a stacked card per invoice below that (customer and amount, then status and signals, then one line with the invoice number, issue date and due date).

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales/invoice-list.tsx:109-248`.
