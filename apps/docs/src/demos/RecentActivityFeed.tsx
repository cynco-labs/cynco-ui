import { type ActivityItem, RecentActivityFeed } from "@cynco-labs/ui";

const items: ActivityItem[] = [
	{
		id: "1",
		kind: "payment",
		direction: "in",
		title: "Syarikat Bina Jaya Sdn. Bhd.",
		subtitle: "DuitNow · INV-2026-0138",
		amount: "6800.00",
		status: "succeeded",
		date: "2026-10-30T08:40:00Z",
	},
	{
		id: "2",
		kind: "invoice",
		direction: "neutral",
		title: "Penang Precision Tooling Sdn. Bhd.",
		subtitle: "INV-2026-0142",
		amount: "12720.00",
		status: "pending",
		date: "2026-10-30T05:15:00Z",
	},
	{
		id: "3",
		kind: "bill",
		direction: "out",
		title: "Tenaga Nasional Berhad",
		subtitle: "BILL-2026-0087",
		amount: "1045.00",
		status: "paid",
		date: "2026-10-29T10:02:00Z",
	},
	{
		id: "4",
		kind: "payment",
		direction: "out",
		title: "KWSP — EPF October",
		subtitle: "FPX · Payroll run Oct 2026",
		amount: "4185.00",
		status: "completed",
		date: "2026-10-28T02:30:00Z",
	},
	{
		id: "5",
		kind: "invoice",
		direction: "neutral",
		title: "Kopi Kampung Trading",
		subtitle: "INV-2026-0117",
		amount: "2200.00",
		status: "overdue",
		date: "2026-10-25T09:00:00Z",
	},
	{
		id: "6",
		kind: "invoice",
		direction: "neutral",
		title: "Klinik Pergigian Seri Kembangan",
		subtitle: "INV-2026-0141",
		amount: null,
		status: "draft",
		date: "2026-10-14T09:00:00Z",
	},
];

export default function RecentActivityFeedDemo() {
	return <RecentActivityFeed items={items} now="2026-10-30T09:25:00Z" />;
}
