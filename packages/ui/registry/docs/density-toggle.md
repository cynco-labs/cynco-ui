# DensityToggle

Compact / Default / Comfortable row density as a small segmented radio group with line-spacing icons; its value drives DensityProvider.

```tsx
import { DensityToggle } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { DataList, DensityProvider, DensityToggle, formatDate, sumAmounts } from "@cynco-labs/ui";

const L = [
	[
		"2026-10-01",
		"JV-2026-0301",
		"1000-001",
		"Maybank Current Account",
		"Opening balance b/f",
		"48250.00",
		"",
	],
	[
		"2026-10-02",
		"INV-2026-0131",
		"1200-001",
		"Trade Debtors",
		"Syarikat Maju Jaya Sdn Bhd",
		"12850.00",
		"",
	],
	[
		"2026-10-02",
		"INV-2026-0131",
		"4000-001",
		"Sales — Services",
		"Syarikat Maju Jaya Sdn Bhd",
		"",
		"11898.15",
	],
	["2026-10-02", "INV-2026-0131", "2300-001", "SST Payable (8%)", "Output tax", "", "951.85"],
	[
		"2026-10-05",
		"BILL-2026-0088",
		"6100-002",
		"Rent Expense",
		"Pelita Hartanah — October rent",
		"4500.00",
		"",
	],
	[
		"2026-10-05",
		"BILL-2026-0088",
		"2000-001",
		"Trade Creditors",
		"Pelita Hartanah Sdn Bhd",
		"",
		"4500.00",
	],
	[
		"2026-10-09",
		"RCPT-2026-0412",
		"1000-001",
		"Maybank Current Account",
		"Receipt — Tropika Kopi",
		"3240.00",
		"",
	],
	[
		"2026-10-09",
		"RCPT-2026-0412",
		"1200-001",
		"Trade Debtors",
		"Tropika Kopi Enterprise",
		"",
		"3240.00",
	],
	[
		"2026-10-15",
		"PAY-2026-0210",
		"6200-001",
		"Salaries & Wages",
		"October payroll",
		"18600.00",
		"",
	],
	["2026-10-15", "PAY-2026-0210", "2210-001", "EPF Payable", "Employer 13%", "", "2418.00"],
	[
		"2026-10-15",
		"PAY-2026-0210",
		"2220-001",
		"SOCSO / EIS Payable",
		"Employer share",
		"",
		"412.30",
	],
	[
		"2026-10-15",
		"PAY-2026-0210",
		"1000-001",
		"Maybank Current Account",
		"Net salaries",
		"",
		"15769.70",
	],
	["2026-10-28", "JV-2026-0311", "6500-001", "Depreciation", "Office equipment", "820.00", ""],
	[
		"2026-10-28",
		"JV-2026-0311",
		"1510-001",
		"Acc. Depreciation — Equipment",
		"Office equipment",
		"",
		"820.00",
	],
	[
		"2026-10-31",
		"JV-2026-0312",
		"3000-001",
		"Retained Earnings",
		"Opening balance b/f",
		"",
		"48250.00",
	],
].map((a, i) => ({
	id: String(i),
	date: a[0],
	ref: a[1],
	code: a[2],
	account: a[3],
	memo: a[4],
	dr: a[5],
	cr: a[6],
}));

const dr = sumAmounts(L.map((r) => r.dr)),
	cr = sumAmounts(L.map((r) => r.cr));

const N2 = new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function amt(v) {
	return v ? <span className="tabular-nums">{N2.format(v)}</span> : null;
}

const cols = [
	{ key: "date", header: "Date", nowrap: true, mobile: "meta", cell: (r) => formatDate(r.date) },
	{
		key: "account",
		header: "Account",
		nowrap: true,
		mobile: "title",
		cell: (r) => (
			<span>
				<span className="mr-2 font-mono text-xs text-tertiary-foreground">{r.code}</span>
				{r.account}
			</span>
		),
	},
	{
		key: "ref",
		header: "Reference",
		mobile: "stacked",
		cell: (r) => <span className="font-mono text-xs text-primary">{r.ref}</span>,
	},
	{
		key: "memo",
		header: "Description",
		mobile: "meta",
		className: "w-full max-w-0",
		cell: (r) => (
			<span className="block truncate text-muted-foreground" title={r.ref + " · " + r.memo}>
				{r.memo}
			</span>
		),
	},
	{ key: "dr", header: "Debit (RM)", align: "right", mobile: "meta", cell: (r) => amt(r.dr) },
	{ key: "cr", header: "Credit (RM)", align: "right", mobile: "meta", cell: (r) => amt(r.cr) },
];

export default function DensityToggleDemo() {
	const [density, setDensity] = useState("compact");
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<div className="text-md font-semibold text-foreground">General ledger · October 2026</div>
					<div className="text-xs text-tertiary-foreground">
						Try: Tab to the toggle, ← → to change density; scroll the list — header and totals stay
						put
					</div>
				</div>
				<DensityToggle value={density} onValueChange={setDensity} />
			</div>
			<DensityProvider density={density}>
				<DataList
					columns={cols}
					rows={L}
					getKey={(r) => r.id}
					caption="General ledger lines"
					stickyHeader
					maxHeight="16rem"
					totals={{ label: "Total", dr: amt(dr), cr: amt(cr) }}
				/>
			</DensityProvider>
		</div>
	);
}
```

## Use

In a list toolbar. Wrap the lists it controls in <DensityProvider density={value}>; every DataList inside picks it up. Pass storageKey to remember the choice per user.

## Props

value / defaultValue ("compact" | "default" | "comfortable", default "default") / onValueChange, labels (auto — hide words when the nearest @container is under 22rem; always; never), storageKey (localStorage, uncontrolled use), label (group name, default "Row density"), className and any div props.

- `value?`: `"compact" | "default" | "comfortable"`
- `defaultValue?`: `"compact" | "default" | "comfortable"`. Default `"default"`.
- `onValueChange?`: `(density: Density) => void`
- `labels?`: `"auto" | "always" | "never"`. `auto` hides the words when the nearest Default `"auto"`.
- `storageKey?`: `string`. Remember the choice in localStorage under this key (uncontrolled use).
- `label?`: `string`. Accessible name of the radio group. Default `"Row density"`.
- Also accepts `ComponentProps<"div">`.

## Notes

The demo DataList uses stickyHeader + maxHeight="16rem" so the header and the totals row stay in view while lines scroll; hidden in print.

Category: Productivity. Source: `packages/ui/src/productivity/workflow.tsx`.
