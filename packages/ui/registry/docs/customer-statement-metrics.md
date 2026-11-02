# CustomerStatementMetrics

Statement of account KPIs: total transactions, invoiced amount with % collected, amount received, balance due, plus credits applied / debits added and the multiple-currencies notice.

```tsx
import { CustomerStatementMetrics } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CustomerStatementMetrics } from "@cynco-labs/ui";

export default function CustomerStatementMetricsDemo() {
	return (
		<CustomerStatementMetrics
			metrics={{
				totalTransactions: 14,
				invoicedAmount: 64246.5,
				collectionRate: 62.4,
				amountReceived: 40096.1,
				creditedAmount: 10746,
				debitedAmount: 1250,
				balanceDue: 48250.4,
			}}
		/>
	);
}
```

## Use

Above the statement of account table.

## Props

metrics {totalTransactions, invoicedAmount, collectionRate, amountReceived, creditedAmount, debitedAmount, balanceDue}, currency, availableCurrencies, isSingleCurrency; className and native div props.

- `metrics`: `StatementMetrics`
- `currency?`: `string`. Default `"MYR"`.
- `availableCurrencies?`: `string[]`
- `isSingleCurrency?`: `boolean`. Default `true`.
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: StatGrid tiles: four-up from 48rem, wrapping to one per row on phones.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
