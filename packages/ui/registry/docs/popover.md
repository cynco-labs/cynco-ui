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
					<div className="text-lg font-semibold text-foreground text-sm">Balance due</div>
					<div className="text-sm font-medium text-muted-foreground">RM 12,720.00 by 27 Nov 2026</div>
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

## Accessibility

| Key | Does |
| --- | --- |
| Esc | Closes the popover, whose dismissal and focus handling belong to Base UI itself. |

The popup adds no role, aria or sr-only text of its own, so anything the popover needs named, you name. The Radix compatibility props onEscapeKeyDown, onPointerDownOutside, onOpenAutoFocus and onCloseAutoFocus are accepted and ignored, so they cannot be used to take over focus.

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/popover.tsx:6-8`.
