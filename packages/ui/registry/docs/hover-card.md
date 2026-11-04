# HoverCard

A richer hover preview (Base UI PreviewCard).

```tsx
import { HoverCard } from "@cynco-labs/ui";
```

## Usage

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@cynco-labs/ui";

export default function HoverCardDemo() {
	return (
		<HoverCard defaultOpen>
			<HoverCardTrigger className="text-sm font-medium text-muted-foreground underline">
				Nusantara Logistik Bhd
			</HoverCardTrigger>
			<HoverCardContent align="start">
				<div className="flex flex-col gap-1">
					<div className="text-lg font-semibold text-foreground text-sm">Nusantara Logistik Bhd</div>
					<div className="text-sm font-medium text-muted-foreground">RM 48,210.00 owed · customer since Mar 2024</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
```

## Use

Previewing a customer or invoice from a link.

## Props

`HoverCardTrigger`, `HoverCardContent` with `align`/`side`.

- `openDelay?`: `number`
- `closeDelay?`: `number`
- Also accepts `PreviewCardPrimitive.Root.Props`.

## Accessibility

The content renders as a Base UI preview card in a portal, and the component adds no role, aria or sr-only text of its own. The Radix-style openDelay and closeDelay props are accepted and ignored.

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/hover-card.tsx:5-14`.
