import { BankReconciliationYearStrip } from "@cynco-labs/ui";

const MONTHS = [
	{ period: "2026-01", state: "closed" },
	{ period: "2026-02", state: "closed" },
	{ period: "2026-03", state: "ready", signedOff: "holds" },
	{ period: "2026-04", state: "ready" },
	{ period: "2026-05", state: "needs_work", openLines: 14 },
	{ period: "2026-06", state: "needs_work", untied: true },
	{ period: "2026-07", state: "no_statement", missing: true },
	{ period: "2026-08", state: "covered", openLines: 3 },
	{ period: "2026-09", state: "needs_work", openLines: 7 },
	{ period: "2026-10", state: "in_progress" },
	{ period: "2026-11", state: "future" },
	{ period: "2026-12", state: "future" },
];

export default function BankReconciliationYearStripDemo() {
	return (
		<BankReconciliationYearStrip
			months={MONTHS}
			selected="2026-09"
			yearLabel="FY 2026"
			accountName="Maybank Current"
			selectedSummary={{ nextStep: "7 lines are posted and waiting to reconcile." }}
		/>
	);
}
