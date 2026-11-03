# VendorListTable

The vendors list: selection, vendor with initials and contact / category / place, You owe (with overdue or All overdue), Paid to date, Last paid and row actions.

```tsx
import { VendorListTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { VendorListTable } from "@cynco-labs/ui";

export default function VendorListTableDemo() {
	return (
		<VendorListTable
			vendors={[
				{
					id: "v1",
					name: "Tenaga Nasional Berhad",
					email: "billing@tnb.com.my",
					category: "Utilities",
					city: "Kuala Lumpur",
					country: "Malaysia",
					outstanding: 1284.6,
					overdue: 1284.6,
					totalPaid: 15420.8,
					lastPaymentDate: "2026-09-24",
				},
				{
					id: "v2",
					name: "Syarikat Logistik Pantas Sdn Bhd",
					email: "ar@pantas.my",
					category: "Freight & delivery",
					city: "Klang",
					country: "Malaysia",
					outstanding: 5450,
					overdue: 0,
					totalPaid: 68900,
					lastPaymentDate: "2026-10-18",
				},
				{
					id: "v3",
					name: "Kenanga Legal Chambers",
					phone: "+60 3-2161 0088",
					category: "Professional fees",
					city: "Kuala Lumpur",
					outstanding: 9800,
					overdue: 4000,
					totalPaid: 22000,
					lastPaymentDate: "2026-08-30",
				},
				{
					id: "v4",
					name: "Grand Office Supplies",
					email: "sales@grandoffice.my",
					category: "Office supplies",
					city: "Petaling Jaya",
					outstanding: 0,
					totalPaid: 4318.25,
					lastPaymentDate: "2026-10-14",
				},
				{
					id: "v5",
					name: "Cetak Kilat Printing",
					email: "order@cetakkilat.my",
					category: "Printing",
					isActive: false,
					totalPaid: 1250,
				},
			]}
		/>
	);
}
```

## Use

Vendors page list.

## Props

vendors [{name, email, phone, category, city, country, isActive, outstanding, overdue, totalPaid, lastPaymentDate}], defaultSelectedIds, currency; selectedIds / onSelectedChange (controlled), onRowClick, className.

- `vendors`: `CyncoVendorRow[]`
- `selectedIds?`: `string[]`
- `onSelectedChange?`: `(ids: string[]) => void`
- `defaultSelectedIds?`: `string[]`
- `currency?`: `string`. Default `"MYR"`.
- `onRowClick?`: `(row: CyncoVendorRow) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: DataList: stacked vendor cards below a 42rem container.

Category: Accounting · Expenses & parties. Source: `packages/ui/src/accounting/parties.tsx`.
