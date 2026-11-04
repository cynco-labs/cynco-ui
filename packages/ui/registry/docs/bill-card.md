# BillCard

A bill as a compact card: vendor initials, vendor name, bill number, total, due date, category, Overdue/Duplicate flags, AI-extraction confidence and GL-posting indicator, with a status quick-action menu.

```tsx
import { BillCard } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BillCard } from "@cynco-labs/ui";
import { useState } from "react";

export default function BillCardDemo() {
	const [selected, setSelected] = useState<string[]>(["b4"]);
	const pick = (id: string) => (on: boolean) => setSelected((ids) => (on ? [...ids, id] : ids.filter((x) => x !== id)));
	return (
		<div className="grid gap-3 sm:grid-cols-2 max-w-[600px]">
			<BillCard
				bill={{
					id: "b1",
					vendorName: "Tenaga Nasional Berhad",
					billNumber: "TNB-220415887",
					totalAmount: "1284.60",
					currency: "MYR",
					dueDate: "2026-10-24",
					status: "awaiting_payment",
					category: "Utilities",
					overdue: true,
					postedToGl: true,
					aiConfidence: 96,
				}}
				selected={selected.includes("b1")}
				onSelectedChange={pick("b1")}
			/>
			<BillCard
				bill={{
					id: "b2",
					vendorName: "Syarikat Logistik Pantas Sdn Bhd",
					billNumber: "SLP/INV/2026/0918",
					totalAmount: "8450.00",
					paidAmount: "3000.00",
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
					totalAmount: "612.30",
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
					totalAmount: "742.18",
					currency: "USD",
					dueDate: "2026-11-02",
					status: "approved",
					category: "Software & hosting",
					postedToGl: false,
				}}
				showStatus
				selected={selected.includes("b4")}
				onSelectedChange={pick("b4")}
			/>
		</div>
	);
}
```

## Use

Expense board columns and anywhere a bill is shown outside a table (set showStatus outside a status column).

## Props

bill (vendorName, billNumber, totalAmount, paidAmount, currency, dueDate, status, category, overdue, isDuplicate, postedToGl, aiConfidence), showStatus, selected / defaultSelected / onSelectedChange, someSelected, onAction(bill, action) where action is a BillAction id such as "archive", never the label on screen; className and native div props.

- `bill`: `CyncoBill`
- `showStatus?`: `boolean`. Status chip on the card, for bills shown outside a board column. Default `false`.
- `selected?`: `boolean`. Whether the card's checkbox is ticked (controlled).
- `defaultSelected?`: `boolean`. Initial tick state when uncontrolled.
- `onSelectedChange?`: `(selected: boolean) => void`. Called when the checkbox is toggled. Passing any of the three selection props shows the checkbox.
- `someSelected?`: `boolean`. Any card on the board selected: keep checkboxes visible.
- `onAction?`: `(bill: CyncoBill, action: BillAction) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Selected state uses border-primary + bg-active-primary. Responsive by container: Wraps its footer and amount instead of clipping in narrow columns.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties/bill-card.tsx:100-286`.
