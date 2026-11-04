# InvoiceLineItems

Editable invoice line rows (item and description, qty, unit price, discount, tax code, amount) with a margin dot, a total and estimated-profit footer, and Add item, Browse library and Add line actions.

```tsx
import { InvoiceLineItems } from "@cynco-labs/ui";
```

## Usage

```tsx
import { InvoiceLineItems, type SalesLineItem } from "@cynco-labs/ui";
import { useState } from "react";

export default function InvoiceLineItemsDemo() {
	const [s, setS] = useState<SalesLineItem[]>([
		{
			name: "Website maintenance retainer",
			description: "October 2026 · 20 hours",
			quantity: 1,
			price: "3500.00",
			discount: "0.00",
			taxCode: "sst8",
			margin: "healthy",
		},
		{
			name: "A4 brochure printing",
			description: "Art card 157gsm, full colour",
			quantity: 500,
			price: "1.20",
			discount: "10.00",
			taxCode: "sst8",
			margin: "below_target",
		},
	]);
	return (
		<InvoiceLineItems
			items={s}
			onChange={setS}
			currency="MYR"
			estimatedProfit={{ amount: "1265.40", percent: 28, health: "healthy" }}
		/>
	);
}
```

## Use

Step 2 of the invoice and quotation builders, and read-only on a stored document (readOnly).

## Props

items (name, description, quantity, price, discount, discountType, taxCode, margin), onChange, currency, taxCodes (value, label, rate; defaults to SST 8%/6%, Sales 10% and Exempt), readOnly, estimatedProfit, onAddItem, onBrowseLibrary; className and native div props.

- `items`: `SalesLineItem[]`
- `onChange?`: `(items: SalesLineItem[]) => void`
- `currency?`: `string`. Default `"MYR"`.
- `taxCodes?`: `readonly SalesTaxCode[]`. Default `DEFAULT_SALES_TAX_CODES`.
- `readOnly?`: `boolean`. Default `false`.
- `estimatedProfit?`: `{ amount: Amount; percent: number; health: NonNullable<SalesLineItem["margin"]> }`. Document-level estimated profit line under the total.
- `onAddItem?`: `() => void`
- `onBrowseLibrary?`: `() => void`
- Also accepts `ComponentProps<"div">`.

## Notes

The footer sits on the tray, below the rows.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales/invoice-line-items.tsx:42-411`.
