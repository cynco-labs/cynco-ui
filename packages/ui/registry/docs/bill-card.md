# BillCard

A bill as a compact card: vendor initials, vendor name, bill number, total, due date, category, Overdue/Duplicate flags, AI-extraction confidence and GL-posting indicator, with a status quick-action menu.

```tsx
import { BillCard } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BillCard } from "@cynco-labs/ui";

export default function BillCardDemo() {
	return (
		<div className="grid gap-3 sm:grid-cols-2 max-w-[600px]">
			<BillCard
				bill={{
					id: "b1",
					vendorName: "Tenaga Nasional Berhad",
					billNumber: "TNB-220415887",
					totalAmount: 1284.6,
					currency: "MYR",
					dueDate: "2026-10-24",
					status: "awaiting_payment",
					category: "Utilities",
					overdue: true,
					postedToGl: true,
					aiConfidence: 96,
				}}
				onToggle={() => {}}
			/>
			<BillCard
				bill={{
					id: "b2",
					vendorName: "Syarikat Logistik Pantas Sdn Bhd",
					billNumber: "SLP/INV/2026/0918",
					totalAmount: 8450,
					paidAmount: 3000,
					currency: "MYR",
					dueDate: "2026-11-12",
					status: "partially_paid",
					category: "Freight & delivery",
					postedToGl: true,
				}}
				showStatus
			/>
			<BillCard
				bill={{
					id: "b3",
					vendorName: "Grand Office Supplies",
					billNumber: "GOS-55102",
					totalAmount: 612.3,
					currency: "MYR",
					dueDate: "2026-11-05",
					status: "in_review",
					category: "Office supplies",
					isDuplicate: true,
					aiConfidence: 71,
				}}
			/>
			<BillCard
				bill={{
					id: "b4",
					vendorName: "Amazon Web Services",
					billNumber: "EUINMY26-1189034",
					totalAmount: 742.18,
					currency: "USD",
					dueDate: "2026-11-02",
					status: "approved",
					category: "Software & hosting",
					postedToGl: false,
				}}
				showStatus
				selected
				onToggle={() => {}}
			/>
		</div>
	);
}
```

## Use

Expense board columns and anywhere a bill is shown outside a table (set showStatus outside a status column).

## Props

bill (vendorName, billNumber, totalAmount, paidAmount, currency, dueDate, status, category, overdue, isDuplicate, postedToGl, aiConfidence), showStatus, selected / onToggle / someSelected, onAction; className and native div props.

## Notes

Selected state uses border-primary + bg-active-primary. Responsive by container: Wraps its footer and amount instead of clipping in narrow columns.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
