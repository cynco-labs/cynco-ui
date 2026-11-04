# IconButton

A Button with a leading or trailing icon slot, sized for Cynco's 14px Phosphor icons, and an optional tooltip.

```tsx
import { IconButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { IconButton } from "@cynco-labs/ui";
import { ArrowsClockwiseIcon, CaretDownIcon, FunnelSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

export default function IconButtonDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<IconButton variant="primary" icon={<PlusIcon size={14} weight="bold" />}>
				New invoice
			</IconButton>
			<IconButton variant="secondary" icon={<FunnelSimpleIcon size={14} />}>
				Filter
			</IconButton>
			<IconButton variant="secondary" rightIcon={<CaretDownIcon size={12} />}>
				Actions
			</IconButton>
			<IconButton
				variant="secondary"
				iconOrientation="center"
				tooltip="Refresh"
				icon={<ArrowsClockwiseIcon size={14} />}
			/>
			<IconButton variant="skeleton" icon={<TrashIcon size={14} />} aria-label="Delete" />
			<IconButton variant="destructive" icon={<TrashIcon size={14} />}>
				Remove
			</IconButton>
		</div>
	);
}
```

## Use

Any action whose icon helps scanning: "New invoice", "Filter". Icon-only for compact toolbars, with `tooltip` so it still has a name.

## Props

All Button props plus `icon`, `rightIcon`, `iconOrientation` (`left` · `center` · `right`), `tooltip` and `tooltipSide`.

- `icon?`: `ReactNode`
- `rightIcon?`: `ReactNode`
- `tooltip?`: `ReactNode`. A hint on hover and focus. On an icon-only button it also names the button when no `aria-label` is given.
- `tooltipSide?`: `"top" | "bottom" | "left" | "right"`. Which side the tooltip opens on.
- `asChild?`: `boolean`. Radix compatibility: render the single child element instead of a `<button>`. Default `false`.
- `isLoading?`: `boolean`. Swaps the label for a spinner and disables the button, while the label stays its accessible name.
- `render?`: `ReactElement`. The element to render instead of a `<button>` (Base UI).
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`.
- `variant?`: `"primary" | "secondary" | "skeleton" | "muted" | "destructive" | "dotted"`. Default `"primary"`.
- `size?`: `"sm" | "md" | "icon"`. Default `"md"`.
- `iconOrientation?`: `"center" | "left" | "right"`. Default `"left"`.
- Also accepts `ComponentProps<"button">`.

## Notes

An icon-only button with a string `tooltip` takes that text as its `aria-label` unless you pass one. Use `skeleton` for icon-only actions inside rows.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/icon-button.tsx:31-118`.
