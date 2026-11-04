# SheetBackdrop

Full-viewport dimming backdrop for inline sheets, portaled to the body.

```tsx
import { SheetBackdrop } from "@cynco-labs/ui";
```

## Usage

```tsx
import { SheetBackdrop } from "@cynco-labs/ui";

export default function SheetBackdropDemo() {
	return (
		<div className="flex flex-col gap-2">
			<div className="text-sm font-medium text-muted-foreground">Content behind an inline sheet</div>
			<SheetBackdrop isOpen onClose={() => {}} />
		</div>
	);
}
```

## Use

Behind floating inline sheet panels.

## Props

`isOpen`, `onClose`, optional `zIndex`.

- `isOpen`: `boolean`
- `onClose`: `() => void`
- `zIndex?`: `number`. Default `SHEET_BACKDROP_Z_INDEX`.
- Also accepts `ComponentProps<typeof motion.div>`.

## Notes

Click closes.

Category: Components · Overlays. Source: `packages/ui/src/base/components/general/sheet-backdrop.tsx:17-47`.
