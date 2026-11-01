# JournalEntryHeader

The journal entry form's top bar: Back, the title with the entry number, the entry status and the From template / Save Draft / Save & Post actions.

```tsx
import { JournalEntryHeader } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

Above the journal entry editor, on both the create and edit screens.

## Props

title, entryNumber?, status? (draft|pending_approval|approved|posted|reversed|cancelled), isCreate, approvalRequired, isSaving, isPosting, onBack, onFromTemplate, onSave, onPost, className? (merged on the root) and native props.

## Notes

Entry number in text-tiny-id. Approval-required entries show "Save & Submit for Approval". Responsive: Actions sit in an ActionBar that wraps under the title on narrow containers.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger.tsx`.
