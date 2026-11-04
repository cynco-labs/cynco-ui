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

`bills` [{id, billNumber, status, totalAmount, currency, issueDate}]; optional `currency`, `onRowClick(bill)`; optional `className` and native div props on the root.

- `bills`: `LinkedBill[]`
- `currency?`: `string`. Default `"MYR"`.
- `onRowClick?`: `(bill: LinkedBill) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: built on DataList: a tray table from 36rem, a stacked card per bill below that.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations/purchase-orders.tsx:294-357`.
