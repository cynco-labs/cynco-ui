# InvoiceSummaryRail

The always-visible total bar under the builder: Subtotal, Discount and Tax figures, a large Total and a caret that opens the full breakdown above it, plus trailing actions.

```tsx
import { InvoiceSummaryRail } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Button, InvoiceSummaryRail, buildSalesTotals } from "@cynco-labs/ui";

export default function InvoiceSummaryRailDemo() {
	const rows = buildSalesTotals({
		subtotal: 4120,
		discount: 206,
		discountPercent: 5,
		taxes: [{ label: "SST (8%)", amount: 313.12 }],
		deposit: 1000,
	});
	return (
		<div className="flex flex-col gap-3">
			<InvoiceSummaryRail
				rows={rows}
				currency="MYR"
				defaultOpen
				actions={<Button variant="primary">Finalize invoice</Button>}
			/>
			<InvoiceSummaryRail
				rows={[]}
				actions={
					<Button variant="secondary" disabled>
						Save draft
					</Button>
				}
			/>
		</div>
	);
}
```

## Use

Sticky footer of the invoice and quotation builders, so the amount stays visible while the preview is collapsed.

## Props

rows (as for InvoiceTotalsPanel), currency, actions (buttons), defaultOpen; className and native div props.

- `rows`: `SalesTotalRow[]`. Totals rows; empty means no line items yet.
- `currency?`: `string`. Default `"MYR"`.
- `actions?`: `ReactNode`
- `defaultOpen?`: `boolean`. Default `false`.
- Also accepts `ComponentProps<"div">`.

## Notes

The secondary figures hide through a container query when the rail is too narrow, so the total never truncates. When there are no rows, it reads 'Add a line item to see the total'. Responsive: The Subtotal/Discount/Tax figures show only from 36rem of container width, and the actions wrap under the total when space runs out.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales.tsx`.
