# InfoTooltip

A small info icon that shows an explanatory tooltip.

```tsx
import { InfoTooltip } from "@cynco-labs/ui";
```

## Usage

```tsx
import { InfoTooltip } from "@cynco-labs/ui";

export default function InfoTooltipDemo() {
	return (
		<div className="flex items-center gap-1.5 text-body">
			Rounding adjustment
			<InfoTooltip>Cash totals round to the nearest 5 sen (BNM rounding).</InfoTooltip>
		</div>
	);
}
```

## Use

Next to labels whose meaning is not obvious.

## Props

Tooltip content as children; optional `side`, `align`.

- `children`: `ReactNode`
- `side?`: `"top" | "bottom" | "left" | "right"`
- `align?`: `"start" | "center" | "end"`
- `sideOffset?`: `number`

Category: Components · Overlays. Source: `packages/ui/src/base/components/general/info-tooltip.tsx`.
