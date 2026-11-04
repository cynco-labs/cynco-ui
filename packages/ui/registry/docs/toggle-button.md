# ToggleButton

A button that stays pressed, with a check mark in its corner while it is on.

```tsx
import { ToggleButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ToggleButton } from "@cynco-labs/ui";
import { ChartBarIcon, FunnelSimpleIcon, UsersIcon } from "@phosphor-icons/react";
import { useState } from "react";

export default function ToggleButtonDemo() {
	const [chart, setChart] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-2">
			<ToggleButton iconOrientation="left" icon={<ChartBarIcon />} pressed={chart} onPressedChange={setChart}>
				Show chart
			</ToggleButton>
			<ToggleButton iconOrientation="left" icon={<UsersIcon />} defaultPressed={false}>
				Group by customer
			</ToggleButton>
			<ToggleButton icon={<FunnelSimpleIcon />} defaultPressed tooltip="Show filters" />
		</div>
	);
}
```

## Use

Toggling views and options in toolbars: show a chart, group rows, reveal filters.

## Props

IconButton props plus `pressed` / `defaultPressed`, `onPressedChange`, `icon` and `iconOrientation` (`left` with a label, `center` icon-only, which needs `tooltip` or `aria-label`).

- `pressed?`: `boolean`. Controlled pressed state.
- `defaultPressed?`: `boolean`. Initial pressed state for uncontrolled use. Default `false`.
- `onPressedChange?`: `(pressed: boolean) => void`
- `variant?`: `"primary" | "secondary" | "skeleton" | "muted" | "destructive" | "dotted"`. Default `"secondary"`.
- `size?`: `"sm" | "md" | "icon"`. Default `"sm"`.
- `icon?`: `ReactNode`
- `iconOrientation?`: `"center" | "left" | "right"`. Default `"center"`.
- `isLoading?`: `boolean`. Swaps the label for a spinner and disables the button, while the label stays its accessible name.
- `asChild?`: `boolean`. Radix compatibility: render the single child element instead of a `<button>`.
- `render?`: `ReactElement`. The element to render instead of a `<button>` (Base UI).
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`.
- `tooltip?`: `ReactNode`. A hint on hover and focus. On an icon-only button it also names the button when no `aria-label` is given.
- `rightIcon?`: `ReactNode`
- `tooltipSide?`: `"top" | "bottom" | "left" | "right"`. Which side the tooltip opens on.
- Also accepts `ComponentProps<"button">`.

## Notes

It reports `aria-pressed` rather than posing as a checkbox; for a real checkbox use `Checkbox`. The corner mark means the state never rests on colour, and it sits slightly outside the button, so a clipping parent hides part of it.

Category: Components · Selection. Source: `packages/ui/src/base/components/general/toggle-button.tsx:17-76`.
