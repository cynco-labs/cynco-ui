# Switch

On/off switch, 36×20 (or 28×16 inside `SwitchSizeProvider size="sm"`).

```tsx
import { Switch } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { Switch, SwitchSizeProvider } from "@cynco-labs/ui";

export default function SwitchDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Switch checked={s} onCheckedChange={setS} />
			<Switch />
			<SwitchSizeProvider size="sm">
				<Switch defaultChecked />
			</SwitchSizeProvider>
			<Switch disabled />
		</div>
	);
}
```

## Use

Settings that take effect immediately.

## Props

`checked`/`defaultChecked`, `onCheckedChange`, `disabled`.

## Notes

Thumb uses `switch-thumb-on` when on.

Category: Components · Selection. Source: `packages/ui/src/base/components/ui/switch.tsx`.
