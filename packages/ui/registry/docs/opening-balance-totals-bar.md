# OpeningBalanceTotalsBar

The opening-balance trial balance's last line: debit and credit totals, whether they balance (or what is out and where the gap goes), and Discard / Post.

```tsx
import { OpeningBalanceTotalsBar } from "@cynco-labs/ui";
```

## Usage

```tsx
import { OpeningBalanceTotalsBar } from "@cynco-labs/ui";

export default function OpeningBalanceTotalsBarDemo() {
	return (
		<div className="flex flex-col gap-3">
			<OpeningBalanceTotalsBar debit={"842310.55"} credit={"842310.55"} filled={38} isDirty />
			<OpeningBalanceTotalsBar
				debit={"842310.55"}
				credit={"839110.55"}
				filled={37}
				isDirty
				suspenseLabel="3900-000 Opening Balance Suspense"
				entryStatus="draft"
			/>
			<OpeningBalanceTotalsBar debit={"0.00"} credit={"0.00"} filled={0} onlySubledger canPost={false} />
		</div>
	);
}
```

## Use

Sticky at the bottom of the opening balances sheet.

## Props

debit, credit, currency?, filled, invalidCount?, overLimit?, maxAmount?, suspenseLabel?, onlySubledger?, entryStatus? (draft|posted), isDirty?, isPosting?, canPost?, onDiscard?, onPost?, className? (merged on the root) and native props.

- `debit`: `Amount`
- `credit`: `Amount`
- `filled`: `number`. Rows with a typed amount.
- `currency?`: `string`. Default `"MYR"`.
- `invalidCount?`: `number`. Default `0`.
- `overLimit?`: `boolean`
- `maxAmount?`: `Amount`
- `suspenseLabel?`: `string`. Default `"3900-000 Opening Balance Suspense"`.
- `onlySubledger?`: `boolean`
- `entryStatus?`: `"draft" | "posted" | null`. Default `null`.
- `isDirty?`: `boolean`
- `isPosting?`: `boolean`
- `canPost?`: `boolean`. Default `true`.
- `onDiscard?`: `() => void`
- `onPost?`: `() => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive: Container-responsive: one line from 48rem, below that the status box and buttons wrap to their own rows.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger/opening-balances.tsx:34-139`.
