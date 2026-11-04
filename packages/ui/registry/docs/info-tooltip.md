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
		<div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
			Rounding adjustment
			<InfoTooltip>Cash totals round to the nearest 5 sen (BNM rounding).</InfoTooltip>
		</div>
	);
}
```

## Use

Next to a label whose meaning is not obvious. Inside a `Field`, pass the same text as `FieldLabel`'s `hint` instead.

## Props

Tooltip content as children; optional `side`, `align`.

- `children`: `ReactNode`
- `side?`: `"top" | "bottom" | "left" | "right"`
- `align?`: `"start" | "center" | "end"`
- `sideOffset?`: `number`

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/info-tooltip.tsx:8-44`.
