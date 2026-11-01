import { PeriodCloseChecklist } from "@cynco-labs/ui";

export default function PeriodCloseChecklistDemo() {
	return (
		<PeriodCloseChecklist
			items={[
				{
					id: "c1",
					status: "fail",
					label: "Depreciation not posted for October 2026",
					detail:
						"3 assets in Office Equipment have RM 1,183.33 of depreciation due this period, and September 2026 is still open.",
					task: "depreciation",
					unclosedPeriod: "2026-09",
				},
				{
					id: "w1",
					status: "warn",
					label: "Suspense account has a balance",
					detail: "3900-000 Opening Balance Suspense holds RM 3,200.00. Clear it before year-end.",
				},
				{
					id: "p1",
					status: "pass",
					label: "Trial balance balances",
					detail: "Debits equal credits: RM 1,284,560.00",
				},
				{
					id: "p2",
					status: "pass",
					label: "No unposted drafts dated in the period",
					detail: "All 142 entries are posted",
				},
				{
					id: "p3",
					status: "pass",
					label: "Receivables tie to the subledger",
					detail: "1200-001 matches 38 open invoices",
				},
				{
					id: "p4",
					status: "pass",
					label: "SST Payable reconciles",
					detail: "2200-000 matches the SST-02 return",
				},
			]}
		/>
	);
}
