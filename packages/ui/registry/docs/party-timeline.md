# PartyTimeline

The party Activity story: month-grouped invoices/bills, payments and bank lines with day, kind dot, reference, due date, status, Overdue chip and amount (with MYR equivalent for foreign documents).

```tsx
import { PartyTimeline } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PartyTimeline } from "@cynco-labs/ui";

export default function PartyTimelineDemo() {
	return (
		<div className="max-w-[620px]">
			<PartyTimeline
				role="customer"
				events={[
					{
						id: "e1",
						kind: "payment",
						date: "2026-10-28",
						title: "DuitNow transfer",
						reference: "INV-2026-0142",
						amount: -8500,
						status: "completed",
					},
					{
						id: "e2",
						kind: "document",
						date: "2026-10-21",
						title: "INV-2026-0156",
						reference: "PO-MESRA-3381",
						dueDate: "2026-11-20",
						amount: 12480.5,
						status: "finalized",
					},
					{
						id: "e3",
						kind: "document",
						date: "2026-10-06",
						title: "INV-2026-0149",
						dueDate: "2026-11-05",
						amount: 3450,
						currency: "SGD",
						baseAmount: 11316.0,
						status: "finalized",
					},
					{
						id: "e4",
						kind: "document",
						date: "2026-09-15",
						title: "INV-2026-0131",
						reference: "PO-MESRA-3302",
						dueDate: "2026-10-15",
						amount: 6680,
						status: "overdue",
						overdue: true,
					},
					{
						id: "e5",
						kind: "bank",
						date: "2026-09-09",
						title: "Maybank · IBG MESRA SDN BHD",
						amount: -4200,
					},
					{
						id: "e6",
						kind: "payment",
						date: "2026-09-02",
						title: "Cheque 004512",
						reference: "INV-2026-0117",
						amount: -6000,
						status: "completed",
					},
				]}
			/>
		</div>
	);
}
```

## Use

Activity tab of customer and vendor pages.

## Props

events [{kind, date, title, reference, status, dueDate, overdue, amount, currency, baseAmount}], role, currency; className and native div props.

- `role`: `"customer" | "vendor"`
- `events`: `PartyEvent[]`
- `currency?`: `string`. Default `"MYR"`.
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: below a 28rem container the day joins the detail line and titles wrap to two lines.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
