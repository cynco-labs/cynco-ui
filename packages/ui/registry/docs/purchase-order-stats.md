# PurchaseOrderStats

Purchase order KPI row: total POs, drafts, approved total.

```tsx
import { PurchaseOrderStats } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PurchaseOrderStats } from "@cynco-labs/ui";

export default function PurchaseOrderStatsDemo() {
	return (
		<PurchaseOrderStats
			stats={[
				{ status: "draft", count: 4, total: "18240.00" },
				{ status: "pending_approval", count: 2, total: "9600.00" },
				{ status: "approved", count: 11, total: "84215.50" },
				{ status: "received", count: 23, total: "162480.00" },
			]}
		/>
	);
}
```

## Use

Top of the purchase orders list.

## Props

`stats` [{status, count, total}]; optional `currency`; optional `className` and native div props on the root.

- `stats`: `{ status: string; count: number; total: Num }[]`
- `currency?`: `string`. Default `"MYR"`.
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: StatGrid tiles auto-fit.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations.tsx`.
