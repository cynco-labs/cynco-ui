# Switch

On/off switch, 36×20 (or 28×16 inside `SwitchSizeProvider size="sm"`).

```tsx
import { Switch } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Label, Switch, SwitchSizeProvider } from "@cynco-labs/ui";
import { useState } from "react";

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

- `thumbClassName?`: `string`
- Also accepts `SwitchPrimitive.Root.Props`.

## Accessibility

| Key | Does |
| --- | --- |
| Enter | Toggles the switch. |
| ⌘Enter / Ctrl+Enter | Stops the toggle so the chord reaches a sheet-level submit shortcut instead. |

Nothing in the component names the switch, so pair it with a Label or pass aria-label. The thumb holds no text and exists only to draw the state, which the Base UI switch owns and exposes through data-checked and data-unchecked.

## Notes

Thumb uses `switch-thumb-on` when on.

Category: Components · Selection. Source: `packages/ui/src/base/components/ui/switch.tsx:27-67`.
