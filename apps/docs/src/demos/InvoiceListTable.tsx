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
