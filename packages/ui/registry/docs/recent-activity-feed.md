# RecentActivityFeed

Unified feed of invoices raised, payments moved and bills entered: kind tile, counterparty and reference, status, signed amount and relative time.

```tsx
import { RecentActivityFeed } from "@cynco-labs/ui";
```

## Usage

```tsx
import { type ActivityItem, RecentActivityFeed } from "@cynco-labs/ui";

const items: ActivityItem[] = [
	{
		id: "1",
		kind: "payment",
		direction: "in",
		title: "Syarikat Bina Jaya Sdn. Bhd.",
		subtitle: "DuitNow · INV-2026-0138",
		amount: 6800,
		status: "succeeded",
		date: "2026-10-30T08:40:00Z",
	},
	{
		id: "2",
		kind: "invoice",
		direction: "neutral",
		title: "Penang Precision Tooling Sdn. Bhd.",
		subtitle: "INV-2026-0142",
		amount: 12720,
		status: "pending",
		date: "2026-10-30T05:15:00Z",
	},
	{
		id: "3",
		kind: "bill",
		direction: "out",
		title: "Tenaga Nasional Berhad",
		subtitle: "BILL-2026-0087",
		amount: 1045,
		status: "paid",
		date: "2026-10-29T10:02:00Z",
	},
	{
		id: "4",
		kind: "payment",
		direction: "out",
		title: "KWSP — EPF October",
		subtitle: "FPX · Payroll run Oct 2026",
		amount: 4185,
		status: "completed",
		date: "2026-10-28T02:30:00Z",
	},
	{
		id: "5",
		kind: "invoice",
		direction: "neutral",
		title: "Kopi Kampung Trading",
		subtitle: "INV-2026-0117",
		amount: 2200,
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
```

## Use

Dashboard 'Recent activity' card.

## Props

items [{id, kind: invoice|payment|bill, direction: in|out|neutral, title, subtitle?, amount, currency?, status, date, href?}] or null; optional now, viewAllHref (clock for relative times); plus className and native element props (spread on the root).

- `items`: `ActivityItem[] | null`
- `now?`: `string | number`
- `viewAllHref?`: `string`
- Also accepts `ComponentProps<"section">`.

## Notes

Responsive: status chip moves under the counterparty below 28rem; names and references wrap instead of truncating.

Category: Accounting · Reports. Source: `packages/ui/src/accounting/reports.tsx`.
