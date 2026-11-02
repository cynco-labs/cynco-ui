# Switch

On/off switch, 36×20 (or 28×16 inside `SwitchSizeProvider size="sm"`).

```tsx
import { Switch } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { Label, Switch, SwitchSizeProvider } from "@cynco-labs/ui";

export default function SwitchDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-4">
			<Label>
				<Switch checked={s} onCheckedChange={setS} />
				Email receipts
			</Label>
			<Label>
				<Switch />
				Auto-reconcile
			</Label>
			<SwitchSizeProvider size="sm">
				<Label>
					<Switch defaultChecked />
					Compact
				</Label>
			</SwitchSizeProvider>
			<Label>
				<Switch disabled />
				Locked
			</Label>
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
