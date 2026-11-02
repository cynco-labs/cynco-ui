# JournalEntryDetailsRail

The Details · Memo · Activity panel beside a journal entry, with the approval/posting timeline.

```tsx
import { JournalEntryDetailsRail } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

Right rail of the journal entry detail page.

## Props

entry { entryDate, period, currency, documentNumber?, manualReason?, vendorName?, customerName?, approvedBy?, approvedAt?, postedAt?, memo? }, statusHistory [{ id, fromStatus, toStatus, changedAt, changedBy?, notes? }], createdAt?, updatedAt?, className? (merged on the root) and native props.

- `entry`: `{ entryDate: string; period: string; currency: string; documentNumber?: string | null; manualReason?: string | null; vendorName?: string | null; customerName?: string | null; approvedBy?: string | null; approvedAt?: string | null; postedAt?: string | null; memo?: string | null }`
- `statusHistory?`: `JournalStatusEvent[]`. Default `[]`.
- `createdAt?`: `string`
- `updatedAt?`: `string`
- Also accepts `ComponentProps<"div">`.

## Notes

A hairline-divided card (divide-y, bg-card, rounded-xl) with section-label captions. Timeline statuses are DocStatus chips and the timeline dots take StatusChip tones. Dates read "29 Oct 2026, 16:05"; period and reference are text-tiny-id. Responsive: fills its container (no fixed width); long values wrap.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger.tsx`.
