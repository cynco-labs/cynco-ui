# BankReconciliationYearStrip

'Month-end close · FY 2026' with year stepping, the fiscal year as twelve month cells with state bars and open-line counts, and the selected month's heading and next step.

```tsx
import { BankReconciliationYearStrip } from "@cynco-labs/ui";
```

## Usage

```tsx
import { type BankCloseMonth, BankReconciliationYearStrip } from "@cynco-labs/ui";
import { useState } from "react";

const MONTHS: BankCloseMonth[] = [
	{ period: "2026-01", state: "closed" },
	{ period: "2026-02", state: "closed" },
	{ period: "2026-03", state: "ready", signedOff: "holds" },
	{ period: "2026-04", state: "ready" },
	{ period: "2026-05", state: "needs_work", openLines: 14 },
	{ period: "2026-06", state: "needs_work", untied: true },
	{ period: "2026-07", state: "no_statement", missing: true },
	{ period: "2026-08", state: "covered", openLines: 3 },
	{ period: "2026-09", state: "needs_work", openLines: 7 },
	{ period: "2026-10", state: "in_progress" },
	{ period: "2026-11", state: "future" },
	{ period: "2026-12", state: "future" },
];

export default function BankReconciliationYearStripDemo() {
	const [selected, setSelected] = useState<string | null>("2026-09");
	return (
		<BankReconciliationYearStrip
			months={MONTHS}
			selected={selected}
			onSelectedChange={setSelected}
			onPreviousYear={() => {}}
			onNextYear={() => {}}
			yearLabel="FY 2026"
			accountName="Maybank Current"
			selectedSummary={{ nextStep: "7 lines are posted and waiting to reconcile." }}
		/>
	);
}
```

## Use

Top of the Reconcile lens for one bank account.

## Props

months [{period 'YYYY-MM', state, openLines, missing, untied, signedOff}], selected / defaultSelected / onSelectedChange, yearLabel, accountName, calendarMonths, selectedSummary {nextStep, signedOffLabel}, onPreviousYear, onNextYear, className and native props (spread on the root).

- `months`: `BankCloseMonth[]`
- `yearLabel`: `string`. "FY 2026"
- `accountName`: `string`
- `selected?`: `string | null`. The month shown as selected, as "2026-03", or `null` for none (controlled).
- `defaultSelected?`: `string | null`. The month selected before the user picks one. Default none.
- `calendarMonths?`: `boolean`. Default `false`.
- `selectedSummary?`: `{ nextStep: string; signedOffLabel?: string }`. The next-step sentence for the selected month, and its sign-off line.
- `onPreviousYear?`: `() => void`. Called when the user clicks the Previous year button.
- `onNextYear?`: `() => void`. Called when the user clicks the Next year button.
- `onSelectedChange?`: `(period: string | null) => void`. Called when the user selects a month cell, or `null` when they deselect it.
- Also accepts `ComponentProps<"div">`.

## Notes

The strip sits in a table-tray band; the selected cell is a raised bg-table-surface tab with a primary underline; bars use var(--status-green/amber) and neutrals. Responsive by container: 12 months across from 42rem, 6 per row from 24rem, 4 per row below.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking/year-strip.tsx:114-250`.
