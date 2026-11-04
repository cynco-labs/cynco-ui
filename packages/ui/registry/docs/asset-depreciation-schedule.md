# AssetDepreciationSchedule

Depreciation schedule by period: charge, accumulated to date, NBV after, and Posted (linked to its journal) or Draft.

```tsx
import { AssetDepreciationSchedule } from "@cynco-labs/ui";
```

## Usage

```tsx
import { AssetDepreciationSchedule } from "@cynco-labs/ui";

export default function AssetDepreciationScheduleDemo() {
	let nbv = 102368.75,
		acc = 46531.25;
	const rows = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"].map((p, i) => {
		acc += 2148.33;
		nbv -= 2148.33;
		return {
			id: `d${i}`,
			period: p,
			depreciationAmount: 2148.33,
			accumulatedToDate: acc,
			netBookValueAfter: nbv,
			isPosted: i < 6,
			journalEntryId: i < 5 ? `je${i}` : null,
		};
	});
	return <AssetDepreciationSchedule entries={rows} />;
}
```

## Use

Fixed asset Depreciation tab, or anywhere a schedule is listed.

## Props

`entries` [{id, period, depreciationAmount, accumulatedToDate, netBookValueAfter, isPosted, journalEntryId}]; optional `onOpenJournal(id)`; optional `className` and native div props on the root.

- `entries`: `AssetDepreciationEntry[]`
- `onOpenJournal?`: `(journalEntryId: string) => void`. Opens the journal entry a posted row was recorded in — a different record from the row itself, reached from the Posted chip, so it is not the list's row-open callback.
- Also accepts `ComponentProps<"div">`.

## Notes

Responsive by container: DataList: table when wide, period/NBV cards when narrow.

Category: Accounting · Tax, assets & operations. Source: `packages/ui/src/accounting/operations/fixed-assets.tsx:266-356`.
