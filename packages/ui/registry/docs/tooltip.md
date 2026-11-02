# Tooltip

Short label shown on hover/focus; delay 0 by default.

```tsx
import { Tooltip } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@cynco-labs/ui";

export default function TooltipDemo() {
	return (
		<div className="pt-10 pl-8">
			<Tooltip defaultOpen>
				<TooltipTrigger render={<Button variant="secondary" />}>Hover me</TooltipTrigger>
				<TooltipContent>Due 30 days after the invoice date</TooltipContent>
			</Tooltip>
		</div>
	);
}
```

## Use

Naming icon-only controls and clarifying terms.

## Props

`TooltipTrigger` (with `render`) and `TooltipContent` (`side`, `align`). `Tooltip` brings its own provider.

- `delayDuration?`: `number`
- Also accepts `TooltipPrimitive.Root.Props`.

## Notes

Keep it to one line.

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/tooltip.tsx`.
