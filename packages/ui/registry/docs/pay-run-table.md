# PayRunTable

The pay run: Ready / Overdue / Selected metrics, a schedule date (and optional Pay from account) with Schedule selected, and a selectable table of payable bills with outstanding amounts and a total-to-pay footer.

```tsx
import { PayRunTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PayRunTable } from "@cynco-labs/ui";

export default function PayRunTableDemo() {
	return (
		<PayRunTable
			today="2026-10-30"
			scheduledDate="2026-11-03"
			defaultSelectedIds={["p1", "p2", "p4"]}
			bankAccounts={[
				{ id: "acc_1", accountCode: "1000-001", accountName: "Maybank Current Account" },
				{ id: "acc_2", accountCode: "1000-002", accountName: "CIMB Business Account" },
			]}
			bills={[
				{
					id: "p1",
					vendorName: "Tenaga Nasional Berhad",
					billNumber: "TNB-220415887",
					dueDate: "2026-10-24",
					totalAmount: 1284.6,
					status: "awaiting_payment",
					overdue: true,
				},
				{
					id: "p2",
					vendorName: "Kenanga Legal Chambers",
					billNumber: "KLC-2026-047",
					dueDate: "2026-11-20",
					totalAmount: 5800,
					status: "approved",
				},
				{
					id: "p3",
					vendorName: "Syarikat Logistik Pantas Sdn Bhd",
					billNumber: "SLP/INV/2026/0918",
					dueDate: "2026-11-12",
					totalAmount: 8450,
					paidAmount: 3000,
					status: "partially_paid",
				},
				{
					id: "p4",
					vendorName: "Telekom Malaysia Berhad",
					billNumber: "TM-1102938",
					dueDate: "2026-11-08",
					totalAmount: 389.0,
					status: "scheduled",
					scheduledPaymentDate: "2026-11-06",
				},
				{
					id: "p5",
					vendorName: "Petronas Dagangan Bhd",
					billNumber: "PDB-FLT-88213",
					dueDate: "2026-11-14",
					totalAmount: 2318.45,
					status: "awaiting_payment",
				},
			]}
		/>
	);
}
```

## Use

Expenses Pay runs view, choosing which approved bills to schedule.

## Props

bills, selectedIds / onSelectedChange or defaultSelectedIds, scheduledDate, today, bankAccounts (optional), onSchedule, isSubmitting; className and native div props.

- `bills`: `CyncoBill[]`. Pay-run eligible bills (approved / awaiting payment / scheduled / partially paid).
- `selectedIds?`: `string[]`
- `onSelectedChange?`: `(ids: string[]) => void`
- `defaultSelectedIds?`: `string[]`
- `scheduledDate?`: `string`. YYYY-MM-DD; defaults to `today`.
- `today?`: `string`. YYYY-MM-DD used to validate the schedule date.
- `bankAccounts?`: `CyncoBankAccount[]`. Optional "Pay from" bank / cash account picker.
- `onSchedule?`: `(billIds: string[], date: string, bankAccountId?: string) => void`
- `isSubmitting?`: `boolean`
- Also accepts `ComponentProps<"div">`.

## Notes

Table primitives inside the DataTable tray: header band on bg-table-tray, rows on bg-table-surface, selected rows bg-active-primary. Only approved or awaiting-payment bills can be scheduled; the rest are counted in an amber 'N excluded' chip. A Pay from account select and a footer total sit on the tray. Responsive: built on StatGrid, ActionBar and DataList: the table becomes stacked bill cards below a 42rem container.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
