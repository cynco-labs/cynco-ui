# BankFeedRow

One bank line: checkbox, lifecycle spine, payee with transfer and review-flag chips, account dot and description, category cell, signed amount, and any proposed matches beneath.

```tsx
import { BankFeedRow } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankFeedRow, type BankFeedTransaction } from "@cynco-labs/ui";

export default function BankFeedRowDemo() {
	const rows: BankFeedTransaction[] = [
		{
			id: "a",
			date: "2026-10-29",
			payeeName: "Petronas Dagangan Bhd",
			description: "POS PETRONAS SS2 PJ",
			type: "debit",
			amount: 182.4,
			status: "imported",
			account: { name: "Maybank Current", color: "#E5A21F" },
			suggestion: { accountName: "Motor Vehicle Expenses", confidence: 0.91 },
		},
		{
			id: "b",
			date: "2026-10-29",
			payeeName: "Syarikat Bekalan Air Selangor",
			description: "JomPAY 6033 AIR SELANGOR",
			type: "debit",
			amount: 96.2,
			status: "categorized",
			account: { name: "Maybank Current", color: "#E5A21F" },
			category: "6210 Utilities",
			flags: ["unusually_large"],
		},
		{
			id: "c",
			date: "2026-10-28",
			payeeName: "Ahmad Faizal bin Rahman",
			description: "DUITNOW REFUND",
			type: "credit",
			amount: 450,
			status: "categorized",
			account: { name: "CIMB Business", color: "#E5484D" },
			category: "6400 Office Supplies",
			flags: ["money_in_to_expense"],
		},
		{
			id: "d",
			date: "2026-10-28",
			payeeName: null,
			description: "SERVICE CHARGE OCT",
			reference: "SC-1026",
			type: "debit",
			amount: 12,
			status: "reconciled",
			account: { name: "CIMB Business", color: "#E5484D" },
			category: "6800 Bank Charges",
		},
		{
			id: "e",
			date: "2026-10-27",
			payeeName: "Lazada",
			description: "LZD*ORDER 2210",
			type: "debit",
			amount: 89.9,
			status: "excluded",
			excludeReason: "duplicate of line 41",
			account: { name: "CIMB Business", color: "#E5484D" },
		},
		{
			id: "f",
			date: "2026-10-27",
			payeeName: "Unknown sender",
			description: "IBG CR 991204",
			type: "credit",
			amount: 2400,
			status: "imported",
			account: { name: "Maybank Current", color: "#E5A21F" },
		},
	];
	return (
		<div className="rounded-lg border border-table-surface-border bg-table-surface overflow-hidden">
			{rows.map((r) => (
				<BankFeedRow key={r.id} tx={r} showAccount onRestore={() => {}} />
			))}
		</div>
	);
}
```

## Use

Inside the feed list, or anywhere a single bank line is listed.

## Props

tx (BankFeedTransaction: payeeName, description, reference, type, amount, status, category, suggestion, isTransfer, flags, excludeReason, account {name, color}, matches), selected / defaultSelected / onSelectedChange, showAccount, className and native props (spread on the root).

- `tx`: `BankFeedTransaction`
- `selected?`: `boolean`. Whether the row's checkbox is ticked (controlled).
- `defaultSelected?`: `boolean`. Initial tick state when uncontrolled. Default `false`.
- `onSelectedChange?`: `(selected: boolean) => void`. Called when the checkbox is toggled by click or Space.
- `onRestore?`: `(tx: BankFeedTransaction) => void`. Called from an excluded line's Restore button; omit to hide it.
- `showAccount?`: `boolean`. Default `false`.
- `tabCell?`: `"select" | "amount" | "detail" | "category" | null`. Set by `BankFeedList`: the row becomes a `role="row"` whose cells take roving focus, and this is the one cell of this row that is tabbable (`null` when the tab stop is on another row). Omit it for a row outside a grid, which then carries no grid markup.
- `onCellFocus?`: `(cell: BankFeedCell) => void`. Called when focus lands anywhere in one of the row's cells.
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: below 32rem the payee wraps to two lines, flags wrap, the category drops under the text and the amount stays top right.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking/feed-row.tsx:68-250`.
