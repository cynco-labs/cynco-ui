# ReceivablesAgingTable

Accounts receivable aging: the five-figure summary strip, then customers (top debtors first) across Current / 1-30 / 31-60 / 61-90 / 90+ / Total with totals on the tray.

```tsx
import { ReceivablesAgingTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ReceivablesAgingTable } from "@cynco-labs/ui";

const rows = [
	{
		id: "c1",
		name: "Syarikat Bina Jaya Sdn. Bhd.",
		invoices: 4,
		current: 21400,
		days1to30: 6800,
		days31to60: 0,
		days61to90: 0,
		over90: 0,
	},
	{
		id: "c2",
		name: "Klinik Pergigian Seri Kembangan",
		current: 12600,
		days1to30: 0,
		days31to60: 4150,
		days61to90: 0,
		over90: 0,
	},
	{
		id: "c3",
		name: "Tan & Rahman Legal Associates",
		invoices: 3,
		current: 9850,
		days1to30: 5400,
		days31to60: 0,
		days61to90: 3400,
		over90: 0,
	},
	{
		id: "c4",
		name: "Kopi Kampung Trading",
		invoices: 1,
		current: 0,
		days1to30: 0,
		days31to60: 3500,
		days61to90: 0,
		over90: 2200,
	},
	{
		id: "c5",
		name: "Penang Precision Tooling Sdn. Bhd.",
		invoices: 2,
		current: 21000,
		days1to30: 6000,
		days31to60: 0,
		days61to90: 0,
		over90: 0,
	},
];

export default function ReceivablesAgingTableDemo() {
	return <ReceivablesAgingTable asOf="31 Oct 2026" rows={rows} dso={38} limit={4} />;
}
```

## Use

AR (or AP with partyLabel 'Vendor') aging report pages and a top-debtors list (limit).

## Props

asOf, rows [{id, name, invoices?, current, days1to30, days31to60, days61to90, over90}]; optional dso, limit, partyLabel, currency; plus className and native element props (spread on the root).

- `asOf`: `string`. "31 Oct 2026".
- `rows`: `AgingCustomerRow[]`
- `dso?`: `number | null`
- `limit?`: `number`. Show only the top N debtors (by total).
- `currency?`: `string`. Default `"MYR"`.
- `partyLabel?`: `string`. "Customer" for receivables, "Vendor" for payables. Default `"Customer"`.
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive: StatGrid summary; DataList table from 42rem, a card per customer (bands as label/value lines, total at right) below; totals are the last row.

Category: Accounting · Reports. Source: `packages/ui/src/accounting/reports.tsx`.
