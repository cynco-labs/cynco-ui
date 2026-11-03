# IconTooltipButton

An icon-only button that always carries a tooltip label.

```tsx
import { IconTooltipButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ArrowsClockwiseIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { IconTooltipButton } from "@cynco-labs/ui";

export default function IconTooltipButtonDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<IconTooltipButton tooltip="Edit" icon={<PencilSimpleIcon size={14} />} />
			<IconTooltipButton tooltip="Refresh" icon={<ArrowsClockwiseIcon size={14} />} />
			<IconTooltipButton tooltip="Delete" disabled icon={<TrashIcon size={14} />} />
		</div>
	);
}
```

## Use

Compact toolbars and row actions where the icon alone is not self-explanatory.

## Props

`tooltip` text, `icon`, `onClick`, optional `disabled`.

- `tooltip`: `string`
- `icon`: `ReactNode`
- `variant?`: `"primary" | "secondary" | "skeleton" | "muted" | "destructive" | "dotted"`. Default `"primary"`.
- `size?`: `"sm" | "default" | "mini" | "icon"`. Default `"default"`.
- `asChild?`: `boolean`
- `isLoading?`: `boolean`
- `transition?`: `boolean`
- `disableActive?`: `boolean`
- `hide?`: `boolean`
- `render?`: `ReactElement`
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`.
- `iconOrientation?`: `"center" | "left" | "right"`. Default `"left"`.
- `rightIcon?`: `ReactNode`
- Also accepts `ComponentProps<"button">`.

## Notes

Every icon-only action should use this (or IconButton + Tooltip) so it has an accessible label.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/icon-tooltip-button.tsx`.
