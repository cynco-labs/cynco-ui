# Checkbox

Square checkbox in three sizes, `primary` when checked.

```tsx
import { Checkbox } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { Checkbox, Label } from "@cynco-labs/ui";

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

Category: Components · Selection. Source: `packages/ui/src/base/components/ui/checkbox.tsx`.
