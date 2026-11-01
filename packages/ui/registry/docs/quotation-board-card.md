# QuotationBoardCard

One quotation on the Kanban board: customer, quotation number, status, total and relative age ('3d ago', 'Yesterday').

```tsx
import { QuotationBoardCard } from "@cynco-labs/ui";
```

## Usage

```tsx
import { QuotationBoardCard } from "@cynco-labs/ui";

export default function QuotationBoardCardDemo() {
	return (
		<div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
			<QuotationBoardCard
				now="2026-10-30"
				quotation={{
					id: "1",
					quotationNumber: "QT-2026-0088",
					customerName: "Syarikat Maju Jaya Sdn Bhd",
					totalAmount: 18600,
					status: "sent",
					createdAt: "2026-10-27",
				}}
			/>
			<QuotationBoardCard
				now="2026-10-30"
				quotation={{
					id: "2",
					quotationNumber: "QT-2026-0085",
					customerName: "Bayu Dental Clinic",
					totalAmount: 7450,
					status: "accepted",
					createdAt: "2026-10-14",
				}}
			/>
			<QuotationBoardCard
				now="2026-10-30"
				quotation={{
					id: "3",
					quotationNumber: "QT-2026-0079",
					customerName: "Rimba Hijau Landscaping",
					totalAmount: 2300,
					status: "expired",
					createdAt: "2026-08-29",
				}}
			/>
		</div>
	);
}
```

## Use

Inside QuotationBoardColumn, or anywhere you show a quotation at a glance.

## Props

quotation ({id, quotationNumber, customerName, totalAmount, currency, status, createdAt}), now (reference date for the relative time), onOpen; className and native button props.

## Notes

A bg-card rounded-xl button that hovers to interactive-secondary-hover. The status is a DocStatus chip, with Converted on the refresh glyph. Responsive: the status moves under the name when the card is very narrow.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales.tsx`.
