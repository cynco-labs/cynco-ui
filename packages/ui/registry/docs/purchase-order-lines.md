# PurchaseOrderLines

Editable PO line items (description, qty, unit price, amount auto-calculated as qty × price) with remove, Add line item, and subtotal / SST / total.

```tsx
import { PurchaseOrderLines } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { PurchaseOrderLines } from "@cynco-labs/ui";

export default function PurchaseOrderLinesDemo() {
	const [s, setS] = useState([
		{
			id: "l1",
			description: "Arabica green beans, Sabah Highland (60kg sack)",
			quantity: 4,
			unitPrice: 1380,
			amount: 5520,
		},
		{
			id: "l2",
			description: "Kraft valve bags 1kg, printed",
			quantity: 2000,
			unitPrice: 0.85,
			amount: 1700,
		},
		{
			id: "l3",
			description: "Delivery to Shah Alam warehouse",
			quantity: 1,
			unitPrice: 180,
			amount: 180,
		},
	]);
	return <PurchaseOrderLines lineItems={s} onChange={setS} taxAmount={462} />;
}
```

## Use

Create or edit a purchase order; `readOnly` on the PO detail.

## Props

`lineItems` [{id, description, quantity, unitPrice, amount}]; optional `onChange` (uncontrolled when omitted), `readOnly`, `currency`, `taxAmount`; optional `className` and native div props on the root.

## Notes

The totals block mirrors the PO's subtotal/tax/total fields.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations.tsx`.
