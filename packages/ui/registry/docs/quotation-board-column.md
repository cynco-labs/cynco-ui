# QuotationBoardColumn

One Kanban column of the quotations board (Draft, Sent / Viewed, Accepted, or Rejected / Expired): icon, label and count above a tray of cards with a column Total, or an empty message.

```tsx
import { QuotationBoardColumn } from "@cynco-labs/ui";
```

## Usage

```tsx
import { QuotationBoardColumn } from "@cynco-labs/ui";

export default function QuotationBoardColumnDemo() {
	return (
		<div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
			<QuotationBoardColumn
				column="active"
				now="2026-10-30"
				quotations={[
					{
						id: "1",
						quotationNumber: "QT-2026-0088",
						customerName: "Syarikat Maju Jaya Sdn Bhd",
						totalAmount: 18600,
						status: "sent",
						createdAt: "2026-10-27",
					},
					{
						id: "2",
						quotationNumber: "QT-2026-0087",
						customerName: "Tropika Kopi Enterprise",
						totalAmount: 4280,
						status: "viewed",
						createdAt: "2026-10-29",
					},
					{
						id: "3",
						quotationNumber: "QT-2026-0084",
						customerName: "Nusantara Logistik Bhd",
						totalAmount: 52000,
						status: "sent",
						createdAt: "2026-10-12",
					},
				]}
			/>
			<QuotationBoardColumn
				column="accepted"
				now="2026-10-30"
				quotations={[
					{
						id: "4",
						quotationNumber: "QT-2026-0085",
						customerName: "Bayu Dental Clinic",
						totalAmount: 7450,
						status: "accepted",
						createdAt: "2026-10-14",
					},
					{
						id: "5",
						quotationNumber: "QT-2026-0080",
						customerName: "Cahaya Print Services",
						totalAmount: 3120,
						status: "converted",
						createdAt: "2026-09-30",
					},
				]}
			/>
			<QuotationBoardColumn column="draft" quotations={[]} />
		</div>
	);
}
```

## Use

Board view of the Quotations page, with four columns side by side.

## Props

column ('draft' | 'active' | 'accepted' | 'terminal'), quotations, currency, now, onOpen; className and native section props.

- `column`: `"terminal" | "draft" | "active" | "accepted"`
- `quotations`: `SalesQuotation[]`
- `currency?`: `string`. Default `"MYR"`.
- `now?`: `string`
- `onOpen?`: `(id: string) => void`
- Also accepts `ComponentProps<"section">`.

## Notes

Responsive: Fluid width (no fixed minimum): lay the columns out in an auto-fit grid or a ScrollRow.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales.tsx`.
