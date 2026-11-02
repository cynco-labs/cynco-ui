# StatTile

One KPI (label, value, optional unit, sub line, badge and status dot) and StatGrid, the auto-fitting grid that holds them.

```tsx
import { StatTile } from "@cynco-labs/ui";
```

## Usage

```tsx
import { StatGrid, StatTile, formatCurrency } from "@cynco-labs/ui";

function Tiles() {
	return (
		<StatGrid min="sm">
			<StatTile label="Sales" value={formatCurrency(184520.75)} tone="green" sub="October 2026" />
			<StatTile label="Pending" value={formatCurrency(46890.35)} tone="blue" />
			<StatTile
				label="Overdue"
				value={formatCurrency(11320)}
				tone="red"
				negative
				badge={<span className="text-xs text-error-text">3 invoices</span>}
			/>
			<StatTile label="Days to pay" value="38" unit="days" sub="DSO, last 90 days" />
		</StatGrid>
	);
}

export default function StatTileDemo() {
	return (
		<div className="flex flex-col gap-3">
			<Tiles />
			<div className="w-full max-w-[340px] rounded-xl border border-dashed border-border p-2">
				<Tiles />
			</div>
		</div>
	);
}
```

## Use

Rows of headline figures above a list or report. Put tiles in a StatGrid so they go 4-up on a page, 2-up in a sheet and 1-up on a phone.

## Props

StatTile: label, value, optional unit, sub, badge, tone (green | blue | red | orange | amber | yellow | purple | pink | fuchsia | neutral), dot (any CSS colour; prefer tone), negative, className, div props, children (e.g. a sparkline). StatGrid: min (sm 9rem | md 11rem | lg 14rem tile width), mode (fit — default, tiles stretch to fill the row; fill — keep empty tracks to align with other grids), className, div props.

- `label`: `ReactNode`
- `value`: `ReactNode`
- `unit?`: `ReactNode`. Small suffix after the value, e.g. "MYR" or "days".
- `sub?`: `ReactNode`. Small line under the value.
- `badge?`: `ReactNode`. Chip or delta at the top right.
- `tone?`: `StatusToneName`. Leading status dot, by status tone.
- `dot?`: `string`. Leading status dot as any CSS colour or var() (prefer `tone`).
- `negative?`: `boolean`. Paint the value as negative/error text.
- Also accepts `ComponentProps<"div">`.

## Notes

The value wraps only between words (after "RM"), never mid-number, and never truncates; it steps up a size once the tile is 13rem wide.

Category: Layout · Primitives. Source: `packages/ui/src/layout/index.tsx`.
