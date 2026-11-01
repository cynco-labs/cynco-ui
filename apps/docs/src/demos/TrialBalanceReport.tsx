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
