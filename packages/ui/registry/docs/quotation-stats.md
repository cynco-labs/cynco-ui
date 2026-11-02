# QuotationStats

The quotation KPI row: Total quoted, Sent, Accepted and Conversion rate.

```tsx
import { QuotationStats } from "@cynco-labs/ui";
```

## Usage

```tsx
import { QuotationStats } from "@cynco-labs/ui";

export default function QuotationStatsDemo() {
	return (
		<QuotationStats
			stats={{
				totalQuotedAmount: 248650,
				currency: "MYR",
				sentCount: 14,
				acceptedCount: 9,
				conversionRate: 37.5,
			}}
		/>
	);
}
```

## Use

Top of the Quotations page.

## Props

stats ({totalQuotedAmount, currency, sentCount, acceptedCount, conversionRate}); className and native div props.

- `stats`: `{ totalQuotedAmount: number; currency?: string; sentCount: number; acceptedCount: number; conversionRate: number }`
- Also accepts `ComponentProps<"div">`.

## Notes

Each accent (warning, success, violet) shrinks to a small coloured square before the label, so the figures stay in foreground. Responsive: StatGrid/StatTile, auto-fit 4-up to 2-up.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales.tsx`.
