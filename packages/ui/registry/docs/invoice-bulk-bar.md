# InvoiceBulkBar

A floating toolbar for ticked invoice rows: 'n selected', Download PDFs, Delete and clear. A blocked action dims and keeps its reason as a tooltip (drafts have no PDF, invoices with payments or voided can't be deleted).

```tsx
import { InvoiceBulkBar } from "@cynco-labs/ui";
```

## Usage

```tsx
import { InvoiceBulkBar } from "@cynco-labs/ui";

export default function InvoiceBulkBarDemo() {
	return (
		<div className="flex flex-col gap-3">
			<InvoiceBulkBar
				selected={[
					{ id: "1", status: "finalized" },
					{ id: "2", status: "overdue" },
					{ id: "3", status: "finalized" },
				]}
			/>
			<InvoiceBulkBar
				selected={[
					{ id: "4", status: "draft" },
					{ id: "5", status: "paid" },
				]}
			/>
		</div>
	);
}
```

## Use

Bottom-centre of the Invoicing page while rows are selected.

## Props

selected ({id, status, hasPayments}), onClear, onDownload, onDelete, downloading, deleting, floating (pins it to the viewport); className and native div props.

- `selected`: `{ id: string; status: string; hasPayments?: boolean }[]`
- `onClear?`: `() => void`
- `onDownload?`: `() => void`
- `onDelete?`: `() => void`
- `downloading?`: `boolean`. Default `false`.
- `deleting?`: `boolean`. Default `false`.
- `floating?`: `boolean`. Pin to the bottom of the viewport, as in the app; off for inline previews. Default `false`.
- Also accepts `ComponentProps<"div">`.

## Notes

A bg-card rounded-xl bar with a shadow and skeleton Buttons. Delete uses the destructive text tone. Responsive: The bar wraps: the count goes on its own line in a narrow container, and it never overflows.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales/invoice-list.tsx:325-405`.
