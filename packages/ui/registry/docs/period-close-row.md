# PeriodCloseRow

One fiscal period in the periods list: open/closed/locked status, year-end marker, account and transaction counts, Dr/Cr totals and the lifecycle actions.

```tsx
import { PeriodCloseRow } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PeriodCloseRow } from "@cynco-labs/ui";

export default function PeriodCloseRowDemo() {
	return (
		<div className="flex flex-col gap-2">
			<PeriodCloseRow
				period={{
					period: "2026-10",
					fiscalStatus: "open",
					accountCount: 64,
					transactionCount: 412,
					totalDebit: "1284560.00",
					totalCredit: "1284560.00",
				}}
			/>
			<PeriodCloseRow
				period={{
					period: "2026-09",
					fiscalStatus: "closed",
					accountCount: 61,
					transactionCount: 388,
					totalDebit: "1102340.50",
					totalCredit: "1102340.50",
				}}
			/>
			<PeriodCloseRow
				period={{
					period: "2026-06",
					fiscalStatus: "locked",
					accountCount: 58,
					transactionCount: 351,
					totalDebit: "984220.10",
					totalCredit: "984220.10",
				}}
			/>
			<PeriodCloseRow
				isYearEnd
				period={{
					period: "2025-12",
					fiscalStatus: "locked",
					accountCount: 57,
					transactionCount: 1,
					totalDebit: "1.00",
					totalCredit: "1.00",
				}}
			/>
		</div>
	);
}
```

## Use

Stacked in the Periods tab, newest first.

## Props

period { period (YYYY-MM), fiscalStatus: open|closed|locked, accountCount, transactionCount, totalDebit, totalCredit }, isYearEnd?, baseCurrency?, onClose, onReopen, onLock, onUnlock, className? (merged on the root) and native props.

- `period`: `LedgerPeriod`
- `isYearEnd?`: `boolean`
- `baseCurrency?`: `string`. Default `"MYR"`.
- `onClose?`: `() => void`
- `onReopen?`: `() => void`
- `onLock?`: `() => void`
- `onUnlock?`: `() => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Card row (rounded-xl border bg-card). Open is a green StatusChip; Closed/Locked are neutral chips carrying the lock glyph; Year-End is a muted Badge. Actions are secondary IconButtons: Close period · Lock + Reopen · Unlock. Responsive: Totals and actions drop under the period name when narrow.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger/period-close.tsx:52-127`.
