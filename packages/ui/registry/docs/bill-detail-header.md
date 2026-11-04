# BillDetailHeader

Bill page header: Bills breadcrumb, vendor title with status and Overdue chips, More menu (Archive with confirm) and Re-extract, plus the Bill no. / Issued / Due / Total / Received fact strip and an archived banner.

```tsx
import { BillDetailHeader } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BillDetailHeader } from "@cynco-labs/ui";

export default function BillDetailHeaderDemo() {
	return (
		<div className="flex flex-col gap-8">
			<BillDetailHeader
				bill={{
					id: "b1",
					vendorName: "Tenaga Nasional Berhad",
					billNumber: "TNB-220415887",
					issueDate: "2026-10-02",
					dueDate: "2026-10-24",
					totalAmount: "1284.60",
					status: "awaiting_payment",
					overdue: true,
				}}
				receivedVia="bills@inbox.cynco.io"
			/>
			<BillDetailHeader
				bill={{
					id: "b2",
					vendorName: "Grand Office Supplies",
					billNumber: "GOS-55102",
					issueDate: "2026-09-14",
					dueDate: "2026-10-14",
					totalAmount: "612.30",
					status: "paid",
					isArchived: true,
				}}
				onRestore={() => {}}
			/>
		</div>
	);
}
```

## Use

Top of the bill detail page.

## Props

bill (vendorName, billNumber, issueDate, dueDate, totalAmount, currency, status, overdue, isArchived), receivedVia, hasDocument, isReExtracting, isExtracting, onReExtract, onArchive, onRestore; className and native div props.

- `bill`: `CyncoBill & { isArchived?: boolean }`
- `receivedVia?`: `string`. Where the bill came from, when it arrived by email.
- `hasDocument?`: `boolean`. Default `true`.
- `isReExtracting?`: `boolean`
- `isExtracting?`: `boolean`
- `onReExtract?`: `() => void`
- `onArchive?`: `() => void`
- `onRestore?`: `() => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: title, actions and fact strip wrap on narrow containers; the archived banner moves its action under the text.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties/bill-detail.tsx:78-207`.
