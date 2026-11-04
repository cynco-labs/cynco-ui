import { StatusChip, StatusChipIcon, StatusRing } from "@cynco-labs/ui";

export default function StatusChipDemo() {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap items-center gap-2">
				<StatusChip tone="green" glyph="check">
					Paid
				</StatusChip>
				<StatusChip tone="blue" glyph="clock">
					Sent
				</StatusChip>
				<StatusChip tone="amber" glyph="alert">
					Overdue
				</StatusChip>
				<StatusChip tone="red" glyph="x">
					Rejected
				</StatusChip>
				<StatusChip tone="neutral" glyph="pause">
					On hold
				</StatusChip>
				<StatusChip tone="purple" glyph="calendar">
					Scheduled
				</StatusChip>
				<StatusChip tone="neutral" dashed>
					Draft
				</StatusChip>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<StatusChipIcon tone="green" glyph="coins" />
				<StatusChipIcon tone="orange" glyph="ticket" />
				<StatusRing tone="blue" fraction={0.66} />
				<span className="text-sm text-subtle">StatusChipIcon · StatusRing</span>
			</div>
		</div>
	);
}
