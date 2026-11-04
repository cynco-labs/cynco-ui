# InvoiceMetricTiles

The all-time invoice metric strip: Sales, Paid, Pending and Overdue, where Overdue turns red and shows an 'n invoices' badge.

```tsx
import { InvoiceMetricTiles } from "@cynco-labs/ui";
```

## Usage

```tsx
import { InvoiceMetricTiles } from "@cynco-labs/ui";

export default function InvoiceMetricTilesDemo() {
	return (
		<InvoiceMetricTiles
			currency="MYR"
			stats={{
				totalValue: "184520.75",
				paidValue: "126310.40",
				pendingValue: "46890.35",
				overdueValue: "11320.00",
				overdueCount: 3,
			}}
			onShowOverdue={() => {}}
		/>
	);
}
```

## Use

Top of the Invoicing page; clicking the Overdue tile filters the list to overdue invoices.

## Props

stats ({totalValue, paidValue, pendingValue, overdueValue, overdueCount}, or null when the stats failed to load, which shows a dash and Unavailable), currency, onShowOverdue; className and native div props.

- `stats`: `{ totalValue: Amount; paidValue: Amount; pendingValue: Amount; overdueValue: Amount; overdueCount: number } | null`. null when the tenant-wide stats could not load: tiles show "—".
- `currency?`: `string`. Default `"MYR"`.
- `onShowOverdue?`: `() => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive: StatGrid/StatTile tiles that auto-fit: 4-up on a page, 2-up on a phone, and the value never truncates.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales/invoice-list.tsx:252-321`.
