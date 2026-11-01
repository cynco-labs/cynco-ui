import { PeriodCloseRow } from "@cynco-labs/ui";

export default function PeriodCloseRowDemo() {
	return (
		<div className="flex flex-col gap-2">
			<PeriodCloseRow
				period={{
					period: "2026-10",
					fiscalStatus: "open",
					accountCount: 64,
					transactionCount: 412,
					totalDebit: 1284560,
					totalCredit: 1284560,
				}}
			/>
			<PeriodCloseRow
				period={{
					period: "2026-09",
					fiscalStatus: "closed",
					accountCount: 61,
					transactionCount: 388,
					totalDebit: 1102340.5,
					totalCredit: 1102340.5,
				}}
			/>
			<PeriodCloseRow
				period={{
					period: "2026-06",
					fiscalStatus: "locked",
					accountCount: 58,
					transactionCount: 351,
					totalDebit: 984220.1,
					totalCredit: 984220.1,
				}}
			/>
			<PeriodCloseRow
				isYearEnd
				period={{
					period: "2025-12",
					fiscalStatus: "locked",
					accountCount: 57,
					transactionCount: 1,
					totalDebit: 1,
					totalCredit: 1,
				}}
			/>
		</div>
	);
}
