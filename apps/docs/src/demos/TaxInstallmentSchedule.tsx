import { TaxInstallmentSchedule } from "@cynco-labs/ui";

export default function TaxInstallmentScheduleDemo() {
	const m = [
		"2026-03-15",
		"2026-04-15",
		"2026-05-15",
		"2026-06-15",
		"2026-07-15",
		"2026-08-15",
		"2026-09-15",
		"2026-10-15",
		"2026-11-15",
		"2026-12-15",
	];
	const st = ["paid", "paid", "paid", "paid", "paid", "paid", "partial", "overdue", "pending", "pending"];
	const rows = m.map((d, i) => {
		const s = st[i];
		return {
			id: `cp${i}`,
			installmentNumber: i + 1,
			dueDate: d,
			amount: 7200,
			paidAmount: s === "paid" ? 7200 : s === "partial" ? 3500 : null,
			status: s,
		};
	});
	return (
		<TaxInstallmentSchedule
			installments={rows}
			totalDue={72000}
			totalPaid={46700}
			description="10 monthly installments (first basis period from Mar 2026), due 15th of each month"
		/>
	);
}
