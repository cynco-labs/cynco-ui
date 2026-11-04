# Checkbox

Square checkbox in three sizes, `primary` when checked.

```tsx
import { Checkbox } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Checkbox, Label } from "@cynco-labs/ui";
import { useState } from "react";

export default function CheckboxDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-4">
			<Label>
				<Checkbox size="sm" checked={s} onCheckedChange={setS} />
				Small
			</Label>
			<Label>
				<Checkbox size="md" defaultChecked />
				Medium
			</Label>
			<Label>
				<Checkbox size="lg" />
				Large
			</Label>
			<Label>
				<Checkbox disabled />
				Disabled
			</Label>
			<Label>
				<Checkbox disabled checked />
				Disabled, checked
			</Label>
		</div>
	);
}
```

## Use

Boolean options in lists and tables; use Switch for settings that apply immediately.

## Props

`checked`/`defaultChecked`, `onCheckedChange`, `size` (`sm` · `md` · `lg`), `disabled`.

- `size?`: `"sm" | "md" | "lg"`. Default `"sm"`.
- `disabled?`: `boolean`. Whether the component should ignore user interaction. Default `false`.
- Also accepts `CheckboxPrimitive.Root.Props`.

## Accessibility

| Key | Does |
| --- | --- |
| Enter | Toggles the checkbox, unless it is disabled. |
| ⌘Enter / Ctrl+Enter | Leaves the checkbox untouched so the chord reaches a sheet-level or form-level submit shortcut. |

The control carries no label of its own, so pair it with a Label or pass aria-label. The invalid treatment is keyed on aria-invalid, which you set and the component never sets for you.

Category: Components · Selection. Source: `packages/ui/src/base/components/ui/checkbox.tsx:12-65`.
