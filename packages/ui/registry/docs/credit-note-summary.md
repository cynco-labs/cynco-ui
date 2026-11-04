# CreditNoteSummary

A credit or debit note's totals and where its money went: Applied, Refunded and Credit left for a credit note, or Paid and Still owed for a debit note, with an optional Payments list.

```tsx
import { CreditNoteSummary } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CreditNoteSummary } from "@cynco-labs/ui";

export default function CreditNoteSummaryDemo() {
	return (
		<div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
			<CreditNoteSummary
				note={{
					noteType: "credit",
					status: "partially_applied",
					subtotal: "1500.00",
					discountAmount: "0.00",
					taxAmount: "120.00",
					totalAmount: "1620.00",
					appliedAmount: "1000.00",
					refundAmount: "200.00",
					remainingAmount: "420.00",
				}}
			/>
			<CreditNoteSummary
				note={{
					noteType: "debit",
					status: "partially_paid",
					subtotal: "800.00",
					taxAmount: "64.00",
					totalAmount: "864.00",
					paidAmount: "500.00",
				}}
				payments={[
					{
						id: "p1",
						paymentDate: "2026-10-21",
						method: "Bank Transfer",
						reference: "MBB-882140",
						amount: "300.00",
					},
					{
						id: "p2",
						paymentDate: "2026-10-27",
						method: "Credit note",
						reference: "CN-2026-0018",
						amount: "200.00",
					},
				]}
			/>
		</div>
	);
}
```

## Use

The credit and debit note detail page.

## Props

note ({noteType, status, subtotal, discountAmount, taxAmount, totalAmount, appliedAmount, refundAmount, remainingAmount, paidAmount, isInvoiceAmendment, currency}) and payments ({id, paymentDate, method, reference, amount}); className and native div props.

- `note`: `SalesNote`
- `payments?`: `SalesNotePayment[]`. Default `[]`.
- Also accepts `ComponentProps<"div">`.

## Notes

The settlement rows hide on drafts, voided notes and invoice amendments. Payments sit on a bg-table-surface list with table-row-divider, and references show in primary `font-mono text-2xs`. Responsive: rows and payments wrap rather than overlap when narrow.

Category: Accounting · Sales. Source: `packages/ui/src/accounting/sales/credit-debit-notes.tsx:69-132`.
