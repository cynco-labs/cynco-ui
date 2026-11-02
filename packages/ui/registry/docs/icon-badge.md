# IconBadge

A badge with a leading or trailing icon.

```tsx
import { IconBadge } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ArrowSquareOutIcon, CoinsIcon, UsersIcon } from "@phosphor-icons/react";
import { IconBadge } from "@cynco-labs/ui";

export default function IconBadgeDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<IconBadge icon={<CoinsIcon size={12} weight="fill" />}>MYR</IconBadge>
			<IconBadge variant="muted" icon={<UsersIcon size={12} />}>
				Shah Alam
			</IconBadge>
			<IconBadge variant="muted" position="right" rightIcon={<ArrowSquareOutIcon size={12} />}>
				MyInvois
			</IconBadge>
		</div>
	);
}
```

## Use

Metadata like currency, branch, external links.

## Props

`icon`/`rightIcon`, `variant` (`default` · `muted`), `position`.

- `variant?`: `"default" | "muted"`. Default `"muted"`.
- `icon?`: `ReactNode`
- `asChild?`: `boolean`. Default `false`.
- `rightIcon?`: `ReactNode`
- `position?`: `"left" | "right"`. Default `"left"`.
- Also accepts `ComponentProps<"span">`.

Category: Components · Data display. Source: `packages/ui/src/base/components/general/icon-badge.tsx`.
