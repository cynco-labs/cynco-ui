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
			status: "sent",
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
