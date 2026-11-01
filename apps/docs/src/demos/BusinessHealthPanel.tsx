import { BusinessHealthPanel } from "@cynco-labs/ui";

const checks = [
	{
		id: "close",
		label: "Sep 2026 can close",
		detail: "2 bank transactions still unmatched",
		area: "books",
		status: "warn",
	},
	{
		id: "bank",
		label: "Bank is reconciled",
		detail: "Maybank current account reconciled to 30 Oct",
		area: "books",
		status: "pass",
	},
	{
		id: "ar",
		label: "Receivables are current",
		detail: "RM 31,450.00 overdue · Kopi Kampung Trading 90+ days",
		area: "collections",
		status: "fail",
	},
	{
		id: "dso",
		label: "Collecting inside 45 days",
		detail: "38 days sales outstanding",
		area: "collections",
		status: "pass",
	},
	{
		id: "bills",
		label: "Bills paid on time",
		detail: "Nothing due this week",
		area: "payables",
		status: "pass",
	},
	{
		id: "sst",
		label: "SST-02 (Sep–Oct) filed",
		detail: "Due 30 Nov 2026",
		area: "compliance",
		status: "na",
	},
];

export default function BusinessHealthPanelDemo() {
	return (
		<div className="max-w-[560px]">
			<BusinessHealthPanel checks={checks} />
		</div>
	);
}
