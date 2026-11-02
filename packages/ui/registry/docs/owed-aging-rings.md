# OwedAgingRings

Receivables and payables as aging rings — one arc per band (Current, 1–30, 31–60, 61–90, 90+), the total in the middle, a keyed legend and the overdue footnote.

```tsx
import { OwedAgingRings } from "@cynco-labs/ui";
```

## Usage

```tsx
import { OwedAgingRings } from "@cynco-labs/ui";

export default function OwedAgingRingsDemo() {
	return (
		<div className="max-w-[460px]">
			<OwedAgingRings
				dso={38}
				receivables={{
					current: 64850,
					days1to30: 18200,
					days31to60: 7650,
					days61to90: 3400,
					over90: 2200,
				}}
				payables={{ current: 39800, days1to30: 8940.6, days31to60: 2500, days61to90: 0, over90: 0 }}
			/>
		</div>
	);
}
```

## Use

The Owed band of the CFO numbers panel, or any compact AR/AP aging glance.

## Props

receivables, payables ({current, days1to30, days31to60, days61to90, over90, total?} or null); optional dso, currency; plus className and native element props (spread on the root).

- `receivables`: `AgingBucket | null`
- `payables`: `AgingBucket | null`
- `currency?`: `string`. Default `"MYR"`.
- `dso?`: `number | null`. Days sales outstanding, shown under receivables.
- Also accepts `ComponentProps<"section">`.

## Notes

Band colours use the status tokens (--status-green/blue/amber/orange/red); the ring track is stroke-muted; key dots use text-tiny tertiary. Responsive: rings sit side by side from 24rem of container width, stacked below.

Category: Accounting · Reports. Source: `packages/ui/src/accounting/reports.tsx`.
