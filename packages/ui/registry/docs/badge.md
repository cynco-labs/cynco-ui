# Badge

A small rounded label in three variants.

```tsx
import { Badge } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Badge } from "@cynco-labs/ui";

export default function BadgeDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Badge>Default</Badge>
			<Badge variant="muted">Muted</Badge>
			<Badge variant="secondary">Secondary</Badge>
			<Badge variant="muted" size="sm">
				Small
			</Badge>
		</div>
	);
}
```

## Use

Counts and neutral labels. Use StatusChip for states.

## Props

`variant` (`default` · `muted` · `secondary`), `size` (`default` · `sm`), children.

- `variant?`: `"default" | "secondary" | "muted"`. Default `"default"`.
- `size?`: `"sm" | "md"`. Default `"md"`.
- `asChild?`: `boolean`. Default `false`.
- Also accepts `useRender.ComponentProps<"span">`.

## Notes

Prefer `muted`; `default` is the zinc pill.

Category: Components · Data display. Source: `packages/ui/src/base/components/ui/badge.tsx:36-55`.
