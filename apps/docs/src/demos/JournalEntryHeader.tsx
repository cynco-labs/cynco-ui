import { JournalEntryHeader } from "@cynco-labs/ui";

export default function JournalEntryHeaderDemo() {
	return (
		<div className="flex flex-col overflow-hidden rounded-xl border">
			<JournalEntryHeader title="New journal entry" isCreate />
			<JournalEntryHeader
				title="Edit JE-2026-0142"
				entryNumber="JE-2026-0142"
				status="pending_approval"
				approvalRequired
				isSaving={false}
			/>
		</div>
	);
}
