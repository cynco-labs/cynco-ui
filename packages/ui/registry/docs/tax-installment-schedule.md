# TaxInstallmentSchedule

CP204 monthly instalment table (#, due date, amount, paid, status) with Mark paid on pending rows and a paid-to-date progress bar.

```tsx
import { TaxInstallmentSchedule } from "@cynco-labs/ui";
```

## Usage

```tsx
import { TaxInstallmentSchedule } from "@cynco-labs/ui";

export default function TaxInstallmentScheduleDemo() {
	const m = [
		"2026-03-15",
		"2026-04-15",
		"2026-05-15",
		"2026-06-15",
		"2026-07-15",
		"2026-08-15",
		"2026-09-15",
		"2026-10-15",
		"2026-11-15",
		"2026-12-15",
	];
	const st = [
		"paid",
		"paid",
		"paid",
		"paid",
		"paid",
		"paid",
		"partial",
		"overdue",
		"pending",
		"pending",
	];
	const rows = m.map((d, i) => {
		const s = st[i];
		return {
			id: "cp" + i,
			installmentNumber: i + 1,
			dueDate: d,
			amount: 7200,
			paidAmount: s === "paid" ? 7200 : s === "partial" ? 3500 : null,
			status: s,
		};
	});
	return (
		<TaxInstallmentSchedule
			installments={rows}
			totalDue={72000}
			totalPaid={46700}
			description="10 monthly installments (first basis period from Mar 2026), due 15th of each month"
		/>
	);
}
```

## Use

Tax return page, CP204 tab.

## Props

`installments` [{id, installmentNumber, dueDate, amount, paidAmount, status: paid|pending|partial|overdue}], `totalDue`, `totalPaid`; optional `onMarkPaid(id)`, `isSubmitting`; optional `description` (defaults to Cynco's 12-instalment copy), `className` and native div props on the root.

## Notes

A table in the DataTable tray (table-tray / table-surface); the totals row sits on the tray and progress shows in the header. Responsive: built on DataList: a tray table when wide, stacked cards (due date, amount, status, paid) when narrow.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations.tsx`.
