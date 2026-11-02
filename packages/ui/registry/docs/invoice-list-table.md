# InvoiceListTable

The invoices list: Invoice #, Customer, Date, Due Date, Amount and Status, with row selection, sort headers and per-row actions.

```tsx
import { InvoiceListTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { InvoiceListTable } from "@cynco-labs/ui";

export default function InvoiceListTableDemo() {
	const rows = [
		{
			id: "1",
			invoiceNumber: "INV-2026-0142",
			customerName: "Syarikat Maju Jaya Sdn Bhd",
			invoiceDate: "2026-10-28",
			dueDate: "2026-11-27",
			total: 12850,
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
			total: 3240,
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
			total: 28400,
			status: "partially_paid",
			journalEntryId: null,
		},
	];
	const [sel, setSel] = useState(["3", "4"]);
	function toggle(id) {
		const s = sel.slice();
		const i = s.indexOf(id);
		if (i < 0) s.push(id);
		else s.splice(i, 1);
		setSel(s);
	}
	return (
		<InvoiceListTable
			invoices={rows}
			selectedIds={sel}
			onToggleRow={toggle}
			onToggleAll={() => {
				setSel(sel.length === rows.length ? [] : rows.map((r) => r.id));
			}}
			sortField="invoice_date"
			sortDirection="desc"
		/>
	);
}
```

## Use

The Invoicing page's main list, above which InvoiceBulkBar appears once rows are ticked.

## Props

invoices (invoiceNumber, customerName, invoiceDate, dueDate, total, currency, status, journalEntryId, emailStatus), selectedIds, onToggleRow, onToggleAll, sortField, sortDirection, onSort, optional footer; className.

- `invoices`: `SalesInvoiceRow[]`
- `selectedIds?`: `string[]`. Default `[]`.
- `onToggleRow?`: `(id: string) => void`
- `onToggleAll?`: `() => void`
- `sortField?`: `string`. Default `"invoice_date"`.
- `sortDirection?`: `"asc" | "desc"`. Default `"desc"`.
- `onSort?`: `(field: string) => void`
- `footer?`: `ReactNode`

## Notes

Invoice numbers use text-tiny-id in primary and amounts are right-aligned tabular-nums. Responsive: Built on DataList: a tray table from 48rem of container width, a stacked card per invoice below that (customer and amount, then status and signals, then Invoice #, Date and Due Date).

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales.tsx`.
