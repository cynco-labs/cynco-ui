import { ReportToolbar } from "@cynco-labs/ui";

const periods = [
	"2026-10",
	"2026-09",
	"2026-08",
	"2026-07",
	"2026-06",
	"2026-05",
	"2026-04",
	"2026-03",
	"2026-02",
	"2026-01",
];

export default function ReportToolbarDemo() {
	return (
		<div className="flex flex-col gap-5">
			<ReportToolbar
				title="Profit & loss"
				meta="October 2026 · MYR"
				defaultPeriod="2026-10"
				periods={periods}
				fiscalYearEnd="12-31"
				defaultView="monthly"
				views={[
					{ value: "monthly", label: "Monthly" },
					{ value: "ytd", label: "YTD" },
				]}
				defaultCompare
				defaultComparePeriod="2026-09"
				freshness={{ mode: "live", lastPostingAt: "2026-10-30T06:10:00Z" }}
				now="2026-10-30T09:25:00Z"
			/>
			<ReportToolbar
				title="Trial balance"
				meta="As at 31 Oct 2026 · MYR · 11 accounts"
				defaultPeriod="2026-10"
				periods={periods}
				fiscalYearEnd="06-30"
				defaultView="standard"
				views={[
					{ value: "standard", label: "Standard" },
					{ value: "extended", label: "Extended" },
				]}
				defaultCompare={false}
				onSaveSnapshot={() => {}}
				freshness={{ mode: "snapshot", takenAt: "2026-10-30T09:12:00Z" }}
				now="2026-10-30T09:25:00Z"
			/>
		</div>
	);
}
