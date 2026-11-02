import { useState } from "react";
import { Checkbox, DataList, DocStatus, INVOICE_STATUS, Money, formatDate } from "@cynco-labs/ui";

const rows = [
	{
		id: "1",
		no: "INV-2026-0142",
		customer: "Syarikat Maju Jaya Sdn Bhd",
		date: "2026-10-28",
		amount: 12850,
		status: "finalized",
	},
	{
		id: "2",
		no: "INV-2026-0140",
		customer: "Tropika Kopi Enterprise",
		date: "2026-10-02",
		amount: 3240,
		status: "overdue",
	},
	{
		id: "3",
		no: "INV-2026-0139",
		customer: "Nusantara Logistik Bhd",
		date: "2026-09-30",
		amount: 28400,
		status: "paid",
	},
];

const cols = [
	{
		key: "no",
		header: "Invoice #",
		mobile: "title",
		nowrap: true,
		cell: (r) => <span className="font-mono text-xs text-primary">{r.no}</span>,
	},
	{ key: "customer", header: "Customer", cell: (r) => r.customer },
	{
		key: "date",
		header: (
			<>
				Date <span aria-hidden="true">↓</span>
			</>
		),
		stackedLabel: "Date",
		nowrap: true,
		sortDirection: "descending",
		cell: (r) => formatDate(r.date),
	},
	{
		key: "status",
		header: "Status",
		mobile: "badge",
		cell: (r) => <DocStatus status={r.status} config={INVOICE_STATUS} />,
	},
	{
		key: "amount",
		header: "Amount",
		align: "right",
		mobile: "value",
		cell: (r) => <Money amount={r.amount} />,
	},
];

function List() {
	const [sel, set] = useState(["2"]);
	return (
		<DataList
			columns={cols}
			rows={rows}
			getKey={(r) => r.id}
			caption="Invoices"
			leading={(r) => (
				<Checkbox
					checked={sel.indexOf(r.id) >= 0}
					onCheckedChange={(v) => {
						set(v ? sel.concat(r.id) : sel.filter((x) => x !== r.id));
					}}
					aria-label={"Select " + r.no}
				/>
			)}
			isRowSelected={(r) => sel.indexOf(r.id) >= 0}
			onRowClick={() => {}}
			totals={{ label: "Total", amount: <Money amount={44490} /> }}
		/>
	);
}

export default function DataListDemo() {
	return (
		<div className="flex flex-col gap-3">
			<List />
			<div className="w-full max-w-[340px] rounded-xl border border-dashed border-border p-2">
				<List />
			</div>
		</div>
	);
}
