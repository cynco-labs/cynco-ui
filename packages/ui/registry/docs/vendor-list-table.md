# VendorListTable

The vendors list: selection, vendor with initials and contact / category / place, You owe (with overdue or All overdue), Paid to date, Last paid and row actions.

```tsx
import { VendorListTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { type CyncoVendorRow, type VendorAction, VendorListTable } from "@cynco-labs/ui";
import { useState } from "react";

export default function VendorListTableDemo() {
	const [last, setLast] = useState("Nothing yet");
	const onAction = (row: CyncoVendorRow, action: VendorAction) => setLast(`${action} · ${row.name}`);
	return (
		<div className="flex flex-col gap-2">
			<VendorListTable
				onAction={onAction}
				vendors={[
					{
						id: "v1",
						name: "Tenaga Nasional Berhad",
						email: "billing@tnb.com.my",
						category: "Utilities",
						city: "Kuala Lumpur",
						country: "Malaysia",
						outstanding: "1284.60",
						overdue: "1284.60",
						totalPaid: "15420.80",
						lastPaymentDate: "2026-09-24",
					},
					{
						id: "v2",
						name: "Syarikat Logistik Pantas Sdn Bhd",
						email: "ar@pantas.my",
						category: "Freight & delivery",
						city: "Klang",
						country: "Malaysia",
						outstanding: "5450.00",
						overdue: "0.00",
						totalPaid: "68900.00",
						lastPaymentDate: "2026-10-18",
					},
					{
						id: "v3",
						name: "Kenanga Legal Chambers",
						phone: "+60 3-2161 0088",
						category: "Professional fees",
						city: "Kuala Lumpur",
						outstanding: "9800.00",
						overdue: "4000.00",
						totalPaid: "22000.00",
						lastPaymentDate: "2026-08-30",
					},
					{
						id: "v4",
						name: "Grand Office Supplies",
						email: "sales@grandoffice.my",
						category: "Office supplies",
						city: "Petaling Jaya",
						outstanding: "0.00",
						totalPaid: "4318.25",
						lastPaymentDate: "2026-10-14",
					},
					{
						id: "v5",
						name: "Cetak Kilat Printing",
						email: "order@cetakkilat.my",
						category: "Printing",
						isActive: false,
						totalPaid: "1250.00",
					},
				]}
			/>
			<p className="text-xs text-tertiary-foreground">Last row action: {last}</p>
		</div>
	);
}
```

## Use

Vendors page list.

## Props

vendors [{name, email, phone, category, city, country, isActive, outstanding, overdue, totalPaid, lastPaymentDate}], currency; selectedIds / defaultSelectedIds / onSelectionChange, onRowClick, onAction(row, action), className.

- `vendors`: `CyncoVendorRow[]`
- `selectedIds?`: `string[]`
- `defaultSelectedIds?`: `string[]`
- `onSelectionChange?`: `(ids: string[]) => void`
- `currency?`: `string`. Default `"MYR"`.
- `onRowClick?`: `(row: CyncoVendorRow) => void`
- `onAction?`: `(row: CyncoVendorRow, action: VendorAction) => void`. Called when a row menu item is chosen. The id is the contract, not the wording on it.
- Also accepts `ComponentProps<"div">`.

## Notes

The row menu reports an action id, not the words on it: record_payment, edit, activate, deactivate or delete. Responsive by container: DataList: stacked vendor cards below a 42rem container.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties/vendor-list.tsx:53-153`.
