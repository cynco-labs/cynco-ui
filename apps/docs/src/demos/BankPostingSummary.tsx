import { BankPostingSummary } from "@cynco-labs/ui";

export default function BankPostingSummaryDemo() {
	return (
		<BankPostingSummary
			defaultActiveKey="6210|debit"
			totals={[
				{
					accountCode: "4000",
					accountName: "Sales Revenue",
					type: "credit",
					count: 38,
					total: "84250.00",
				},
				{
					accountCode: "1200-001",
					accountName: "Trade Receivables",
					type: "credit",
					count: 12,
					total: "46980.50",
				},
				{ accountCode: "6210", accountName: "Utilities", type: "debit", count: 4, total: "2316.80" },
				{
					accountCode: "6120",
					accountName: "EPF Contributions",
					type: "debit",
					count: 1,
					total: "6842.00",
				},
				{ accountCode: "6130", accountName: "SOCSO & EIS", type: "debit", count: 1, total: "1187.60" },
				{ accountCode: null, accountName: null, type: "debit", count: 2, total: "310.00" },
			]}
		/>
	);
}
