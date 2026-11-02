# PurchaseOrderLinkedBills

Bills linked to a purchase order: bill number, issue date, amount and bill status.

```tsx
import { PurchaseOrderLinkedBills } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PurchaseOrderLinkedBills } from "@cynco-labs/ui";

export default function PurchaseOrderLinkedBillsDemo() {
	return (
		<div className="max-w-[460px]">
			<PurchaseOrderLinkedBills
				bills={[
					{
						id: "b1",
						billNumber: "BILL-2026-0311",
						status: "paid",
						totalAmount: "5520.00",
						issueDate: "2026-10-02",
					},
					{
						id: "b2",
						billNumber: "BILL-2026-0327",
						status: "awaiting_payment",
						totalAmount: "1802.00",
						issueDate: "2026-10-19",
					},
					{ id: "b3", billNumber: null, status: "draft", totalAmount: null, issueDate: null },
				]}
			/>
		</div>
	);
}
```

## Use

PO detail sidebar.

## Props

`bills` [{id, billNumber, status, totalAmount, currency, issueDate}]; optional `currency`, `onOpen(id)`; optional `className` and native div props on the root.

- `bills`: `{ id: string; billNumber: string | null; status: string | null; totalAmount: Num; currency?: string | null; issueDate: string | null }[]`
- `currency?`: `string`. Default `"MYR"`.
- `onOpen?`: `(id: string) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: rows wrap amount and status under the bill number when narrow.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations.tsx`.
