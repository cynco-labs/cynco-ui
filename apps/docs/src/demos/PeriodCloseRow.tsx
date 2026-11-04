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
					totalDebit: "1284560.00",
					totalCredit: "1284560.00",
				}}
			/>
			<PeriodCloseRow
				period={{
					period: "2026-09",
					fiscalStatus: "closed",
					accountCount: 61,
					transactionCount: 388,
					totalDebit: "1102340.50",
					totalCredit: "1102340.50",
				}}
			/>
			<PeriodCloseRow
				period={{
					period: "2026-06",
					fiscalStatus: "locked",
					accountCount: 58,
					transactionCount: 351,
					totalDebit: "984220.10",
					totalCredit: "984220.10",
				}}
			/>
			<PeriodCloseRow
				isYearEnd
				period={{
					period: "2025-12",
					fiscalStatus: "locked",
					accountCount: 57,
					transactionCount: 1,
					totalDebit: "1.00",
					totalCredit: "1.00",
				}}
			/>
		</div>
	);
}
