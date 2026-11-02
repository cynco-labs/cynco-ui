# Popover

A floating panel on `overlay` anchored to a trigger.

```tsx
import { Popover } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Button, Popover, PopoverContent, PopoverTrigger } from "@cynco-labs/ui";

export default function PopoverDemo() {
	return (
		<Popover defaultOpen>
			<PopoverTrigger render={<Button variant="secondary" />}>Payment details</PopoverTrigger>
			<PopoverContent align="start" aria-label="Payment details" className="w-64">
				<div className="flex flex-col gap-1.5 p-1">
					<div className="text-main text-sm">Balance due</div>
					<div className="text-body">RM 12,720.00 by 27 Nov 2026</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
```

## Use

Inline details, small forms and pickers.

## Props

`PopoverTrigger` (use `render` to supply your Button), `PopoverContent` with `align`, `side`, `sideOffset`.

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/popover.tsx`.
