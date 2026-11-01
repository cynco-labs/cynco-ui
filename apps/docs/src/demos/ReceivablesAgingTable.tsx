import { ReceivablesAgingTable } from "@cynco-labs/ui";

const rows = [
	{
		id: "c1",
		name: "Syarikat Bina Jaya Sdn. Bhd.",
		invoices: 4,
		current: 21400,
		days1to30: 6800,
		days31to60: 0,
		days61to90: 0,
		over90: 0,
	},
	{
		id: "c2",
		name: "Klinik Pergigian Seri Kembangan",
		current: 12600,
		days1to30: 0,
		days31to60: 4150,
		days61to90: 0,
		over90: 0,
	},
	{
		id: "c3",
		name: "Tan & Rahman Legal Associates",
		invoices: 3,
		current: 9850,
		days1to30: 5400,
		days31to60: 0,
		days61to90: 3400,
		over90: 0,
	},
	{
		id: "c4",
		name: "Kopi Kampung Trading",
		invoices: 1,
		current: 0,
		days1to30: 0,
		days31to60: 3500,
		days61to90: 0,
		over90: 2200,
	},
	{
		id: "c5",
		name: "Penang Precision Tooling Sdn. Bhd.",
		invoices: 2,
		current: 21000,
		days1to30: 6000,
		days31to60: 0,
		days61to90: 0,
		over90: 0,
	},
];

export default function ReceivablesAgingTableDemo() {
	return <ReceivablesAgingTable asOf="31 Oct 2026" rows={rows} dso={38} limit={4} />;
}
