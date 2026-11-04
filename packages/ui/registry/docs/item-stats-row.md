# ItemStatsRow

Items KPI row: estimated margin on sales (or average profit margin), average revenue per item, highest earning item, most sold item, each over the trailing sales window.

```tsx
import { ItemStatsRow } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ItemStatsRow } from "@cynco-labs/ui";

export default function ItemStatsRowDemo() {
	return (
		<ItemStatsRow
			stats={{
				avgProfitMargin: 34.5,
				avgRevenuePerItem: 1842.6,
				highestEarningItem: { name: "Kopi O Kaw 1kg", revenue: 28800 },
				mostSoldItem: { name: "Cold brew bottle 250ml", quantity: 4200 },
			}}
			realizedMargins={{ marginPercent: 31.84, lineCount: 212, belowCostItemCount: 2 }}
		/>
	);
}
```

## Use

Above the items list.

## Props

`stats` {avgProfitMargin, avgRevenuePerItem, highestEarningItem, mostSoldItem}; optional `realizedMargins` {marginPercent, lineCount, belowCostItemCount}, `currency`, `windowDays`; optional `className` and native div props on the root.

- `stats`: `{ avgProfitMargin: number | null; avgRevenuePerItem: Num; highestEarningItem: { name: string; revenue: Num } | null; mostSoldItem: { name: string; quantity: number } | null }`
- `realizedMargins?`: `{ marginPercent: number | null; lineCount: number; belowCostItemCount: number }`
- `currency?`: `string`. Default `"MYR"`.
- `windowDays?`: `number`. Default `30`.
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: StatGrid tiles auto-fit and never truncate.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations/items.tsx:226-298`.
