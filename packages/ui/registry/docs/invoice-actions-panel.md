# InvoiceActionsPanel

The invoice view's Actions card, which lists only the shortcuts the status allows (Send email or reminder, Mark as paid, Download receipt, Edit, Delivery orders, Credit and debit notes).

```tsx
import { InvoiceActionsPanel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { InvoiceActionsPanel } from "@cynco-labs/ui";

export default function InvoiceActionsPanelDemo() {
	return (
		<div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] max-w-[560px]">
			<InvoiceActionsPanel status="finalized" emailSent />
			<InvoiceActionsPanel status="draft" />
		</div>
	);
}
```

## Use

Right rail of the invoice detail page.

## Props

status, emailSent, onAction(label); className and native section props.

- `status`: `string`
- `emailSent?`: `boolean`. Default `false`.
- `onAction?`: `(label: string) => void`
- Also accepts `ComponentProps<"section">`.

## Notes

Responsive: Built on the SectionPanel primitive.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales.tsx`.
