# IconCheckbox

A toggle that looks like a small secondary button with an icon; checked shows the `primary` border and a check mark in its corner.

```tsx
import { IconCheckbox } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { ChartBarIcon, FunnelSimpleIcon, UsersIcon } from "@phosphor-icons/react";
import { IconCheckbox } from "@cynco-labs/ui";

export default function IconCheckboxDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-2">
			<IconCheckbox
				variant="secondary"
				iconOrientation="left"
				icon={<ChartBarIcon />}
				checked={s}
				onCheckedChange={setS}
			>
				Show chart
			</IconCheckbox>
			<IconCheckbox variant="secondary" iconOrientation="left" icon={<UsersIcon />} checked={false}>
				Group by customer
			</IconCheckbox>
			<IconCheckbox variant="secondary" icon={<FunnelSimpleIcon />} checked aria-label="Show filters" />
		</div>
	);
}
```

## Use

Toggling views and options in toolbars and attach/cancel forms.

## Props

Button props plus `checked`, `onCheckedChange`, `icon`, `iconOrientation` (`left` with a label, `center` icon-only, which needs an `aria-label`).

- `defaultChecked?`: `boolean`. Initial state for uncontrolled use. Default `false`.
- `variant?`: `"primary" | "secondary" | "skeleton" | "muted" | "destructive" | "dotted"`. Default `"secondary"`.
- `size?`: `"sm" | "default" | "mini" | "icon"`. Default `"sm"`.
- `icon?`: `ReactNode`
- `asChild?`: `boolean`. Default `false`.
- `isLoading?`: `boolean`
- `transition?`: `boolean`
- `disableActive?`: `boolean`
- `hide?`: `boolean`. Default `false`.
- `render?`: `ReactElement`
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`.
- `iconOrientation?`: `"left" | "center" | "right"`. Default `"center"`.
- `checked?`: `boolean`
- `onCheckedChange?`: `(checked: boolean) => void`
- Also accepts `ComponentProps<"button">`.

## Notes

Default size `sm`. State is exposed as `aria-pressed` and shown by the corner check mark, not by colour alone. The mark sits slightly outside the button, so a clipping parent (`overflow-hidden`, or the `primary` variant's own clip) hides part of it.

Category: Components · Selection. Source: `packages/ui/src/base/components/general/icon-checkbox.tsx`.
