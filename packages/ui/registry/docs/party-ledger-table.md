# PartyLedgerTable

The party subledger: Date, Event, Document, Amount and running Balance, newest first.

```tsx
import { PartyLedgerTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PartyLedgerTable } from "@cynco-labs/ui";

export default function PartyLedgerTableDemo() {
	return (
		<div className="max-w-[640px]">
			<PartyLedgerTable
				rows={[
					{
						id: "l1",
						entryDate: "2026-09-02",
						event: "payment_received",
						documentNumber: "RCPT-2026-0388",
						amount: -6000,
						runningBalance: 35769.9,
					},
					{
						id: "l2",
						entryDate: "2026-09-15",
						event: "invoice_posted",
						documentNumber: "INV-2026-0131",
						amount: 6680,
						runningBalance: 42449.9,
					},
					{
						id: "l3",
						entryDate: "2026-10-06",
						event: "invoice_posted",
						documentNumber: "INV-2026-0149",
						amount: 11316,
						runningBalance: 53765.9,
					},
					{
						id: "l4",
						entryDate: "2026-10-09",
						event: "debit_note_posted",
						documentNumber: "DN-2026-0007",
						amount: 1250,
						runningBalance: 55015.9,
					},
					{
						id: "l4b",
						entryDate: "2026-10-14",
						event: "credit_note_applied",
						documentNumber: "CN-2026-0021",
						amount: -10746,
						runningBalance: 44269.9,
					},
					{
						id: "l5",
						entryDate: "2026-10-21",
						event: "invoice_posted",
						documentNumber: "INV-2026-0156",
						amount: 12480.5,
						runningBalance: 56750.4,
					},
					{
						id: "l6",
						entryDate: "2026-10-28",
						event: "payment_received",
						documentNumber: "RCPT-2026-0412",
						amount: -8500,
						runningBalance: 48250.4,
					},
				]}
			/>
		</div>
	);
}
```

## Use

Ledger tab of customer and vendor pages — the ground-truth statement behind the position.

## Props

rows [{entryDate, event, documentNumber, documentType, amount, runningBalance}] oldest-first, currency; className.

## Notes

Responsive by container: DataList: stacked entries below a 36rem container.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
