# BetaBadge

A tiny "BETA" tag.

```tsx
import { BetaBadge } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BetaBadge } from "@cynco-labs/ui";

export default function BetaBadgeDemo() {
	return (
		<div className="flex items-center gap-2 text-main">
			E-invoicing
			<BetaBadge />
		</div>
	);
}
```

## Use

Next to the title of a feature in beta.

## Props

Optional `className`.

- `variant?`: `"default" | "secondary" | "muted"`. Default `"default"`.
- `size?`: `"sm" | "default"`. Default `"default"`.
- `asChild?`: `boolean`
- Also accepts `useRender.ComponentProps<"span">`.

Category: Components · Data display. Source: `packages/ui/src/base/components/general/beta-badge.tsx`.
