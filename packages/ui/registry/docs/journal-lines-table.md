# JournalLinesTable

The read-only line items of a saved journal entry: line number, account (code, name, type), description, debit, credit and totals.

```tsx
import { JournalLinesTable } from "@cynco-labs/ui";
```

## Usage

```tsx
import { JournalLinesTable } from "@cynco-labs/ui";

export default function JournalLinesTableDemo() {
	return (
		<JournalLinesTable
			currency="MYR"
			lines={[
				{
					id: "1",
					lineNumber: 1,
					accountCode: "6100-000",
					accountName: "Salaries & Wages",
					accountType: "expense",
					debitAmount: "18500.00",
					creditAmount: "0",
					description: "October 2026 payroll – gross",
				},
				{
					id: "2",
					lineNumber: 2,
					accountCode: "6110-000",
					accountName: "EPF Employer Contribution",
					accountType: "expense",
					debitAmount: "2405.00",
					creditAmount: "0",
					description: "Employer EPF 13%",
				},
				{
					id: "3",
					lineNumber: 3,
					accountCode: "2300-001",
					accountName: "EPF Payable",
					accountType: "liability",
					debitAmount: "0",
					creditAmount: "4440.00",
					description: "EPF employee + employer",
				},
				{
					id: "4",
					lineNumber: 4,
					accountCode: "2300-003",
					accountName: "PCB Payable",
					accountType: "liability",
					debitAmount: "0",
					creditAmount: "1210.00",
					description: null,
				},
				{
					id: "5",
					lineNumber: 5,
					accountCode: "1000-001",
					accountName: "Maybank Current Account",
					accountType: "asset",
					debitAmount: "0",
					creditAmount: "15255.00",
					description: "Net salaries paid",
				},
			]}
		/>
	);
}
```

## Use

On the journal entry detail page beside the details rail.

## Props

lines [{ id, lineNumber, accountCode, accountName, accountType, debitAmount, creditAmount, description? }], currency?, className? (merged on the root) and native props.

- `lines`: `JournalPostedLine[]`
- `currency?`: `string`. Default `"MYR"`.
- Also accepts `ComponentProps<"section">`.

## Notes

The Balanced / Unbalanced state is a StatusChip in the header. Empty sides are blank and totals are formatted with formatCurrency. Responsive: built on DataList: a tray table on wide containers, stacked line cards (account, Dr/Cr amount, description) below 36rem.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger.tsx`.
