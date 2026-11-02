# JournalBalanceBar

The journal form's DR = CR footer: debit and credit totals with Balanced or Off by MYR x, plus the auto-save line.

```tsx
import { JournalBalanceBar } from "@cynco-labs/ui";
```

## Usage

```tsx
import { JournalBalanceBar } from "@cynco-labs/ui";

export default function JournalBalanceBarDemo() {
	return (
		<div className="flex flex-col gap-3">
			<JournalBalanceBar totalDebit={20905} totalCredit={20905} currency="MYR" autoSave="saved" />
			<JournalBalanceBar
				totalDebit={20905}
				totalCredit={20655}
				currency="MYR"
				showError
				autoSave="saving"
			/>
			<JournalBalanceBar totalDebit={0} totalCredit={0} />
		</div>
	);
}
```

## Use

Pinned under the line editor so the user always sees whether the entry balances before posting.

## Props

totalDebit, totalCredit, currency?, hasAmounts?, showError?, autoSave? (saving|saved), className? (merged on the root) and native props.

- `totalDebit`: `number`
- `totalCredit`: `number`
- `autoSave?`: `"saving" | "saved" | null`. The auto-save line above the bar.
- `currency?`: `string`. Default `"MYR"`.
- `hasAmounts?`: `boolean`
- `showError?`: `boolean`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive: Totals and the balance chip wrap onto two lines when narrow.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger.tsx`.
