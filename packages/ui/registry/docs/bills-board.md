# BillsBoard

The bills Kanban: In Review, Pending Approval, Awaiting Payment, Scheduled and Paid columns of BillCards with counts, empty messages and a compact per-currency column total.

```tsx
import { BillsBoard } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { BillsBoard } from "@cynco-labs/ui";

export default function BillsBoardDemo() {
	const [s, setS] = useState(["b5"]);
	return (
		<BillsBoard
			columns={["in_review", "awaiting_payment"]}
			selectedIds={s}
			onToggleBill={(id) => {
				setS(s.indexOf(id) >= 0 ? s.filter((x) => x !== id) : s.concat([id]));
			}}
			bills={[
				{
					id: "b1",
					vendorName: "Grand Office Supplies",
					billNumber: "GOS-55102",
					totalAmount: 612.3,
					dueDate: "2026-11-05",
					status: "in_review",
					category: "Office supplies",
					aiConfidence: 94,
				},
				{
					id: "b2",
					vendorName: "Petronas Dagangan Bhd",
					billNumber: "PDB-FLT-88213",
					totalAmount: 2318.45,
					dueDate: "2026-11-14",
					status: "in_review",
					category: "Fuel",
					aiConfidence: 88,
				},
				{
					id: "b3",
					vendorName: "Kenanga Legal Chambers",
					billNumber: "KLC-2026-047",
					totalAmount: 5800,
					dueDate: "2026-11-20",
					status: "pending_approval",
					category: "Professional fees",
				},
				{
					id: "b4",
					vendorName: "Tenaga Nasional Berhad",
					billNumber: "TNB-220415887",
					totalAmount: 1284.6,
					dueDate: "2026-10-24",
					status: "awaiting_payment",
					category: "Utilities",
					overdue: true,
					postedToGl: true,
				},
				{
					id: "b5",
					vendorName: "Syarikat Logistik Pantas Sdn Bhd",
					billNumber: "SLP/INV/2026/0918",
					totalAmount: 8450,
					paidAmount: 3000,
					dueDate: "2026-11-12",
					status: "partially_paid",
					category: "Freight & delivery",
					postedToGl: true,
				},
			]}
		/>
	);
}
```

## Use

The Expenses page board view.

## Props

bills, columns (subset of board keys, in order), selectedIds + onToggleBill, paidFilterLabel; className and native div props.

- `bills`: `CyncoBill[]`
- `columns?`: `("paid" | "in_review" | "pending_approval" | "awaiting_payment" | "scheduled")[]`. Columns to show, in board order (default: all five).
- `selectedIds?`: `string[]`
- `onToggleBill?`: `(id: string) => void`
- `paidFilterLabel?`: `string`. Default `"Past 30 Days"`.
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: columns sit side by side from a 48rem container and stack as sections (cards two-up from 36rem) below that.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
