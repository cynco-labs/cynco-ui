# TrialBalanceReport

The trial balance grid: account code and name, Debit/Credit pairs per column group, a totals row that must tie, and a Balanced/Unbalanced chip.

```tsx
import { TrialBalanceReport } from "@cynco-labs/ui";
```

## Usage

```tsx
import { TrialBalanceReport } from "@cynco-labs/ui";

const rows = [
	{
		accountId: "a1",
		accountCode: "1000-001",
		accountName: "Cash at bank – Maybank",
		accountType: "asset",
		debit: 184520.4,
	},
	{
		accountId: "a2",
		accountCode: "1100-001",
		accountName: "Trade receivables",
		accountType: "asset",
		debit: 96300,
	},
	{
		accountId: "a3",
		accountCode: "1500-001",
		accountName: "Office equipment",
		accountType: "asset",
		debit: 38900,
	},
	{
		accountId: "a4",
		accountCode: "1510-001",
		accountName: "Accumulated depreciation – office equipment",
		accountType: "contra_asset",
		credit: 9725,
	},
	{
		accountId: "a5",
		accountCode: "2000-001",
		accountName: "Trade payables",
		accountType: "liability",
		credit: 51240.6,
	},
	{
		accountId: "a6",
		accountCode: "2100-001",
		accountName: "SST payable",
		accountType: "liability",
		credit: 6420,
	},
	{
		accountId: "a7",
		accountCode: "3000-001",
		accountName: "Share capital",
		accountType: "equity",
		credit: 100000,
	},
	{
		accountId: "a8",
		accountCode: "3100-001",
		accountName: "Retained earnings",
		accountType: "equity",
		credit: 78744.8,
	},
	{
		accountId: "a9",
		accountCode: "4000-001",
		accountName: "Sales – services",
		accountType: "revenue",
		credit: 214600,
	},
	{
		accountId: "a10",
		accountCode: "5000-001",
		accountName: "Cost of sales",
		accountType: "expense",
		debit: 92410,
	},
	{
		accountId: "a11",
		accountCode: "6100-001",
		accountName: "Salaries & wages",
		accountType: "expense",
		debit: 48600,
	},
];

export default function TrialBalanceReportDemo() {
	return (
		<TrialBalanceReport
			period="October 2026"
			rows={rows}
			showType
			description="11 accounts with balances · Kedai Runcit Maju Sdn. Bhd."
		/>
	);
}
```

## Use

The trial balance report in its standard, comparative (current | prior | variance) or extended (unadjusted | adjustments | adjusted) shape.

## Props

rows ({accountId, accountCode, accountName, accountType?, debit?, credit?}); optional groups [{label, muted, signed, debit(row), credit(row), totalDebit?, totalCredit?}], period, description, showType, balanced, badgeLabel, currency; plus className and native element props (spread on the root).

- `rows`: `TrialBalanceAccount[]`
- `title?`: `string`. Default `"Trial balance"`.
- `description?`: `ReactNode`
- `period?`: `string`. Period label for the heading, e.g. "October 2026".
- `groups?`: `TrialBalanceColumnGroup[]`. Column groups; defaults to one pair read from `row.debit` / `row.credit`.
- `showType?`: `boolean`. Default `false`.
- `balanced?`: `boolean`. Override the computed balanced state (totals of every unsigned group tie).
- `badgeLabel?`: `string`. Which figures the chip speaks for, when there is more than one set.
- `currency?`: `string`. Default `"MYR"`.
- Also accepts `ComponentProps<"div">`.

## Notes

Zero Dr/Cr cells stay blank, totals get an accountant's double rule, codes use `font-mono text-2xs`. Responsive: DataList tray table from 36rem of container width, one card per account below (blank Dr/Cr show an em dash there); built on SectionPanel + DataList.

Category: Accounting · Reports. Source: `packages/ui/src/accounting/reports/trial-balance.tsx:52-193`.
