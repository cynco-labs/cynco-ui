# StockBalancesReport

Stock balances by item and location (on hand, WAC to 4 dp, value, Healthy/Low/Negative) with the GL inventory vs stock ledger reconciliation strip.

```tsx
import { StockBalancesReport } from "@cynco-labs/ui";
```

## Usage

```tsx
import { StockBalancesReport } from "@cynco-labs/ui";

export default function StockBalancesReportDemo() {
	return (
		<StockBalancesReport
			period="Oct 2026"
			balances={[
				{
					itemId: "i1",
					itemName: "Kopi O Kaw 1kg",
					locationName: "Shah Alam HQ",
					quantity: 126,
					unitOfMeasure: "pack",
					weightedAvgCost: 29.4,
					value: 3704.4,
					reorderPoint: 40,
				},
				{
					itemId: "i2",
					itemName: "Cold brew bottle 250ml",
					locationName: "Shah Alam HQ",
					quantity: 420,
					unitOfMeasure: "pcs",
					weightedAvgCost: 3.45,
					value: 1449,
					reorderPoint: 500,
				},
				{
					itemId: "i5",
					itemName: "Paper cup 12oz",
					locationName: "Penang outlet",
					quantity: -2,
					unitOfMeasure: "ctn",
					weightedAvgCost: 162,
					value: -324,
					reorderPoint: 10,
				},
				{
					itemId: "i6",
					itemName: "Oat milk 1L",
					locationName: "Penang outlet",
					quantity: 96,
					unitOfMeasure: "btl",
					weightedAvgCost: 11.8,
					value: 1132.8,
				},
			]}
			reconciliation={{
				glBalance: 6286.2,
				subledgerBalance: 5962.2,
				difference: 324,
				isReconciled: false,
			}}
		/>
	);
}
```

## Use

Inventory workspace balances and reports.

## Props

`balances` [{itemId, itemName, locationName, quantity, unitOfMeasure, weightedAvgCost, value, reorderPoint}], `reconciliation` {glBalance, subledgerBalance, difference, isReconciled}; optional `period`; optional `className` and native section props on the root.

- `balances`: `StockBalanceRow[]`
- `reconciliation`: `{ glBalance: Num; subledgerBalance: Num; difference: Num; isReconciled: boolean }`
- `period?`: `string`
- Also accepts `ComponentProps<"section">`.

## Notes

Balances table, per-item balance status and a reconciliation strip in one panel. Responsive: DataList for balances; the reconciliation strip wraps.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations/inventory.tsx:125-212`.
