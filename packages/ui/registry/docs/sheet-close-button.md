# SheetCloseButton

The ✕ button positioned in a sheet's top-right corner.

```tsx
import { SheetCloseButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { SheetCloseButton } from "@cynco-labs/ui";

export default function SheetCloseButtonDemo() {
	return (
		<div className="relative h-10 w-40 rounded-lg border bg-card">
			<SheetCloseButton onClose={() => {}} />
		</div>
	);
}
```

## Use

Custom inline sheets that do not use SheetContent's built-in close.

## Props

`onClose`.

## Notes

Positions itself absolutely; the parent must be `relative`.

Category: Components · Overlays. Source: `packages/ui/src/base/components/general/sheet-close-button.tsx`.
