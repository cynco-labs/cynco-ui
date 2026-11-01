# JournalLineEditor

The spreadsheet-style debit/credit grid of a journal entry, with an account picker in each Account cell, line description, grouped amount inputs and Add line.

```tsx
import { JournalLineEditor } from "@cynco-labs/ui";
```

## Usage

```tsx
import { JournalLineEditor } from "@cynco-labs/ui";

const ACCTS = [
	{
		id: "a1",
		accountCode: "1000-001",
		accountName: "Maybank Current Account",
		accountType: "asset",
		normalBalance: "debit",
	},
	{
		id: "a2",
		accountCode: "1000-002",
		accountName: "CIMB Business Account",
		accountType: "asset",
		normalBalance: "debit",
	},
	{
		id: "a3",
		accountCode: "1100-000",
		accountName: "Petty Cash",
		accountType: "asset",
		normalBalance: "debit",
	},
	{
		id: "a4",
		accountCode: "1200-001",
		accountName: "Trade Receivables",
		accountType: "asset",
		normalBalance: "debit",
	},
	{
		id: "a5",
		accountCode: "1510-000",
		accountName: "Accumulated Depreciation – Office Equipment",
		accountType: "contra_asset",
		normalBalance: "credit",
	},
	{
		id: "a6",
		accountCode: "2000-001",
		accountName: "Trade Payables",
		accountType: "liability",
		normalBalance: "credit",
	},
	{
		id: "a7",
		accountCode: "2200-000",
		accountName: "SST Payable",
		accountType: "liability",
		normalBalance: "credit",
	},
	{
		id: "a8",
		accountCode: "2300-001",
		accountName: "EPF Payable",
		accountType: "liability",
		normalBalance: "credit",
	},
	{
		id: "a9",
		accountCode: "2300-002",
		accountName: "SOCSO & EIS Payable",
		accountType: "liability",
		normalBalance: "credit",
	},
	{
		id: "a10",
		accountCode: "2300-003",
		accountName: "PCB Payable",
		accountType: "liability",
		normalBalance: "credit",
	},
	{
		id: "a11",
		accountCode: "3000-000",
		accountName: "Share Capital",
		accountType: "equity",
		normalBalance: "credit",
	},
	{
		id: "a12",
		accountCode: "3100-000",
		accountName: "Retained Earnings",
		accountType: "equity",
		normalBalance: "credit",
	},
	{
		id: "a13",
		accountCode: "4000-001",
		accountName: "Sales – Consulting Services",
		accountType: "revenue",
		normalBalance: "credit",
	},
	{
		id: "a14",
		accountCode: "6100-000",
		accountName: "Salaries & Wages",
		accountType: "expense",
		normalBalance: "debit",
	},
	{
		id: "a15",
		accountCode: "6110-000",
		accountName: "EPF Employer Contribution",
		accountType: "expense",
		normalBalance: "debit",
	},
	{
		id: "a16",
		accountCode: "6200-000",
		accountName: "Office Rent",
		accountType: "expense",
		normalBalance: "debit",
	},
	{
		id: "a17",
		accountCode: "6400-000",
		accountName: "Depreciation Expense",
		accountType: "expense",
		normalBalance: "debit",
	},
];

export default function JournalLineEditorDemo() {
	return (
		<JournalLineEditor
			accounts={ACCTS}
			recentIds={["a14", "a8", "a1"]}
			fieldErrors={{ "l5.accountId": "Confirm the account before posting" }}
			lines={[
				{
					key: "l1",
					accountId: "a14",
					accountCode: "6100-000",
					accountName: "Salaries & Wages",
					description: "October 2026 payroll – gross",
					debitAmount: "18500",
					creditAmount: "",
				},
				{
					key: "l2",
					accountId: "a15",
					accountCode: "6110-000",
					accountName: "EPF Employer Contribution",
					description: "Employer EPF 13%",
					debitAmount: "2405",
					creditAmount: "",
				},
				{
					key: "l3",
					accountId: "a8",
					accountCode: "2300-001",
					accountName: "EPF Payable",
					description: "EPF employee 11% + employer 13%",
					debitAmount: "",
					creditAmount: "4440",
				},
				{
					key: "l4",
					accountId: "a10",
					accountCode: "2300-003",
					accountName: "PCB Payable",
					description: "Monthly tax deduction (PCB)",
					debitAmount: "",
					creditAmount: "1210",
				},
				{
					key: "l5",
					accountCode: "1000-001",
					accountName: "Maybank Current Account",
					description: "Net salaries paid",
					debitAmount: "",
					creditAmount: "15255",
				},
			]}
		/>
	);
}
```

## Use

Inside the journal entry form, above the balance bar, for creating or editing a manual journal.

## Props

lines [{ key, accountId?, accountCode?, accountName?, description?, debitAmount?, creditAmount? }], accounts (picker list), recentIds?, fieldErrors? keyed `${key}.accountId`, onLinesChange?, className? (merged on the root) and native props.

## Notes

An AI-suggested but unconfirmed account (code with no id) shows a dashed border and an amber warning glyph. Remove is a skeleton icon button, disabled at two lines (double-entry minimum).

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger.tsx`.
