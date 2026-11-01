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
			<div className="text-body">Content behind an inline sheet</div>
			<SheetBackdrop isOpen onClose={() => {}} />
		</div>
	);
}
```

## Use

Behind floating inline sheet panels.

## Props

`isOpen`, `onClose`, optional `zIndex`.

## Notes

Click closes.

Category: Components · Overlays. Source: `packages/ui/src/base/components/general/sheet-backdrop.tsx`.
