# Separator

A 1px horizontal or vertical rule in `border`.

```tsx
import { Separator } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Separator } from "@cynco-labs/ui";

export default function SeparatorDemo() {
	return (
		<div className="flex flex-col gap-3 max-w-[360px] text-body">
			Above
			<Separator />
			<div className="flex items-center gap-3 h-5">
				Left
				<Separator orientation="vertical" />
				Right
			</div>
		</div>
	);
}
```

## Use

Dividing groups in toolbars and panels.

## Props

`orientation`.

- `orientation?`: `"horizontal" | "vertical"`. The orientation of the separator. Default `'horizontal'`.
- `decorative?`: `boolean`. Default `true`.
- Also accepts `SeparatorPrimitive.Props`.

Category: Components · Layout. Source: `packages/ui/src/base/components/ui/separator.tsx`.
