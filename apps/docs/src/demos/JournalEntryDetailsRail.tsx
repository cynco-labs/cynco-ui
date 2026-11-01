import { JournalEntryDetailsRail } from "@cynco-labs/ui";

export default function JournalEntryDetailsRailDemo() {
	return (
		<JournalEntryDetailsRail
			className="max-w-sm"
			entry={{
				entryDate: "2026-10-29",
				period: "2026-10",
				currency: "MYR",
				documentNumber: "PAY-2026-10",
				vendorName: null,
				customerName: null,
				approvedBy: "Nurul Aina (Finance Manager)",
				postedAt: "2026-10-29T16:12:00",
				memo: "Payroll for 14 staff. SOCSO and EIS booked separately on JE-2026-0143.",
			}}
			statusHistory={[
				{
					id: "s2",
					fromStatus: "draft",
					toStatus: "pending_approval",
					changedAt: "2026-10-29T11:02:00",
					changedBy: "Hafiz Rahman",
				},
				{
					id: "s3",
					fromStatus: "pending_approval",
					toStatus: "approved",
					changedAt: "2026-10-29T16:05:00",
					changedBy: "Nurul Aina",
					notes: "Checked against the October HR payroll summary.",
				},
				{
					id: "s4",
					fromStatus: "approved",
					toStatus: "posted",
					changedAt: "2026-10-29T16:12:00",
					changedBy: "Nurul Aina",
				},
			]}
		/>
	);
}
