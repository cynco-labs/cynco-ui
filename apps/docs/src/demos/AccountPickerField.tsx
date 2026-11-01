import { AccountPickerField } from "@cynco-labs/ui";

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

export default function AccountPickerFieldDemo() {
	return (
		<AccountPickerField
			label="Account"
			accounts={ACCTS}
			recentIds={["a14", "a8", "a1"]}
			selectedId="a14"
			defaultOpen
		/>
	);
}
