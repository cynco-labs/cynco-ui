# BankFeedRow

One bank line: checkbox, lifecycle spine, payee with transfer and review-flag chips, account dot and description, category cell, signed amount, and any proposed matches beneath.

```tsx
import { BankFeedRow } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BankFeedRow } from "@cynco-labs/ui";

const MATCH_INV = {
	id: "m1",
	targetLabel: "Invoice · TechNova Solutions Sdn Bhd",
	targetReference: "INV-2026-0142",
	confidence: 0.94,
	status: "proposed",
	evidence: [
		"Amount equal (RM 12,720.00)",
		"Reference INV-2026-0142 in description",
		"Paid 2 days after due date",
	],
	consequence:
		"Accepting records the receipt against INV-2026-0142 and marks it Paid. The line posts to 1200-001 Trade Receivables instead of a revenue account.",
};

const MATCH_BILL = {
	id: "m2",
	targetLabel: "Bill · Tenaga Nasional Berhad",
	targetReference: "BILL-2026-0088",
	confidence: 0.81,
	status: "proposed",
	evidence: ["Amount equal (RM 1,184.30)", "Payee matches supplier", "Within 3 days of bill date"],
	consequence: "Accepting settles BILL-2026-0088 and posts the line to 2100-001 Trade Payables.",
};

export default function BankFeedRowDemo() {
	const rows = [
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
				<BankFeedRow key={r.id} tx={r} showAccount />
			))}
		</div>
	);
}
```

## Use

Inside the feed list, or anywhere a single bank line is listed.

## Props

tx (BankFeedTransaction: payeeName, description, reference, type, amount, status, category, suggestion, isTransfer, flags, excludeReason, account {name, color}, matches), selected, showAccount, className and native props (spread on the root).

## Notes

Responsive by container: below 32rem the payee wraps to two lines, flags wrap, the category drops under the text and the amount stays top right.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking.tsx`.
