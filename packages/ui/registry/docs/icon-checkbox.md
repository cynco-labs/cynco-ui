# IconCheckbox

A toggle that looks like a small secondary button with an icon; checked shows the `primary` border.

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
			<IconCheckbox variant="secondary" icon={<FunnelSimpleIcon />} checked />
		</div>
	);
}
```

## Use

Toggling views and options in toolbars and attach/cancel forms.

## Props

Button props plus `checked`, `onCheckedChange`, `icon`, `iconOrientation` (`left` with a label, `center` icon-only).

## Notes

Default size `sm`.

Category: Components · Selection. Source: `packages/ui/src/base/components/general/icon-checkbox.tsx`.
