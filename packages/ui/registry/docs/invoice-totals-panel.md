# InvoiceTotalsPanel

The document totals block: Subtotal, Discount (n%), the tax line(s), Total, and Deposit and Balance Due when a deposit is set.

```tsx
import { InvoiceTotalsPanel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { InvoiceTotalsPanel, buildSalesTotals } from "@cynco-labs/ui";

export default function InvoiceTotalsPanelDemo() {
	const rows = buildSalesTotals({
		subtotal: 12000,
		discount: 600,
		discountPercent: 5,
		taxes: [{ label: "SST (8%)", amount: 912 }],
		deposit: 3000,
	});
	return (
		<div className="max-w-[340px] ml-auto">
			<InvoiceTotalsPanel rows={rows} currency="MYR" />
		</div>
	);
}
```

## Use

Under the line items in the invoice and quotation builders.

## Props

rows ({label, value, bold, accent, negative}), which you can build with the exported buildSalesTotals({subtotal, discount, discountPercent, taxes, deposit}), and currency; className and native dl props.

## Notes

A bg-card bordered panel with text-tertiary-foreground labels. Total is semibold above a table-row-divider, and Balance Due is the one text-primary accent. Responsive: Label and value wrap onto two lines rather than overlapping in a narrow column.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales.tsx`.
