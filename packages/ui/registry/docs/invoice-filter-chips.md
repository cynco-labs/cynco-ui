# InvoiceFilterChips

One removable chip per active list filter (search, status, issued, due or created period, amount range, issued by, currency), plus Clear all.

```tsx
import { InvoiceFilterChips } from "@cynco-labs/ui";
```

## Usage

```tsx
import { InvoiceFilterChips } from "@cynco-labs/ui";
import { useState } from "react";

export default function InvoiceFilterChipsDemo() {
	const [s, setS] = useState([
		{ key: "search", label: "Search", value: "“Tropika”" },
		{ key: "status", label: "Status", value: "Overdue" },
		{ key: "issued", label: "Issued", value: "1 Oct 2026 – 31 Oct 2026" },
		{ key: "amount", label: "Amount", value: "RM 1,000 – RM 10,000" },
		{ key: "currency", label: "Currency", value: "MYR only" },
	]);
	return (
		<InvoiceFilterChips
			chips={s}
			onRemove={(k) => {
				setS(s.filter((c) => c.key !== k));
			}}
			onClearAll={() => {
				setS([]);
			}}
		/>
	);
}
```

## Use

Under the invoice search bar, so the active filters are visible and each can be removed.

## Props

chips ({key, label, value}), onRemove(key), onClearAll; className and native div props.

- `chips`: `SalesFilterChip[]`
- `onRemove?`: `(key: string) => void`
- `onClearAll?`: `() => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive: Built on ActionBar, so the chips wrap.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales/invoice-list.tsx:415-440`.
