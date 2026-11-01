# ScrollArea

A scroll container with thin custom scrollbars.

```tsx
import { ScrollArea } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ScrollArea } from "@cynco-labs/ui";

export default function ScrollAreaDemo() {
	return (
		<ScrollArea className="h-32 w-64 rounded-lg border bg-card">
			<div className="p-3 flex flex-col gap-2">
				{Array.from({ length: 14 }, (_, i) => (
					<div key={i} className="text-body">
						{"Event #" + (1040 + i)}
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
```

## Use

Lists inside fixed-height panels and popovers.

## Props

Children; sizing classes; `ScrollBar orientation` for horizontal.

Category: Components · Layout. Source: `packages/ui/src/base/components/ui/scroll-area.tsx`.
