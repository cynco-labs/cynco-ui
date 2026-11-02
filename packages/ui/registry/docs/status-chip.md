# StatusChip

A neutral chip whose only colour is a small status square with a glyph.

```tsx
import { StatusChip } from "@cynco-labs/ui";
```

## Usage

```tsx
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
				<span className="text-body-secondary">StatusChipIcon · StatusRing</span>
			</div>
		</div>
	);
}
```

## Use

Invoice, payment and filing states in tables and headers.

## Props

`tone` (green · blue · red · orange · amber · yellow · purple · pink · fuchsia · neutral), `glyph` (check, clock, alert, x, pause, play, calendar, coins, …), `dashed` for drafts, label as children. `StatusChipIcon` is the square alone; `StatusRing` is a progress ring (`fraction` 0–1).

- `tone?`: `StatusTone`
- `glyph?`: `StatusGlyph`
- `dashed?`: `boolean`. Default `false`.
- Also accepts `ComponentProps<"span">`.

## Notes

Never colour the label — the square carries the state, and every state has a glyph and a word, so it never relies on hue. Tone hexes are fixed in the component (e.g. green #30a46c, blue #3e8bd9, red #e5484d, amber #e5a21f), not tokens.

Category: Components · Data display. Source: `packages/ui/src/base/components/general/status-chip.tsx`.
