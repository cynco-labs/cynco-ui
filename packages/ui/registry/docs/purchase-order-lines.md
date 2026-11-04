# PurchaseOrderLines

Editable PO line items (description, qty, unit price, amount auto-calculated as qty × price) with remove, Add line item, and subtotal / SST / total.

```tsx
import { PurchaseOrderLines } from "@cynco-labs/ui";
```

## Usage

```tsx
import { type POLine, PurchaseOrderLines } from "@cynco-labs/ui";
import { useState } from "react";

export default function PurchaseOrderLinesDemo() {
	const [s, setS] = useState<POLine[]>([
		{
			id: "l1",
			description: "Arabica green beans, Sabah Highland (60kg sack)",
			quantity: "4.00",
			unitPrice: "1380.00",
			amount: "5520.00",
		},
		{
			id: "l2",
			description: "Kraft valve bags 1kg, printed",
			quantity: "2000.00",
			unitPrice: "0.85",
			amount: "1700.00",
		},
		{
			id: "l3",
			description: "Delivery to Shah Alam warehouse",
			quantity: "1.00",
			unitPrice: "180.00",
			amount: "180.00",
		},
	]);
	return <PurchaseOrderLines lineItems={s} onLineItemsChange={setS} taxAmount={462} />;
}
```

## Use

Create or edit a purchase order; `readOnly` on the PO detail.

## Props

`lineItems` [{id, description, quantity, unitPrice, amount}]; optional `defaultLineItems` and `onLineItemsChange` (uncontrolled when omitted), `readOnly`, `currency`, `taxAmount`; optional `className` and native div props on the root.

- `lineItems?`: `POLine[]`. Controlled lines.
- `defaultLineItems?`: `POLine[]`. Initial lines for uncontrolled use. Default `[]`.
- `onLineItemsChange?`: `(items: POLine[]) => void`
- `readOnly?`: `boolean`. Default `false`.
- `currency?`: `string`. Default `"MYR"`.
- `taxAmount?`: `Amount`
- Also accepts `ComponentProps<"div">`.

## Notes

The totals block mirrors the PO's subtotal/tax/total fields.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations/purchase-orders.tsx:65-282`.
