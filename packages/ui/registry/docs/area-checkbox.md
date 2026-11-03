# AreaCheckbox

A checkbox with a title and description, optionally revealing children when checked.

```tsx
import { AreaCheckbox } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { AreaCheckbox } from "@cynco-labs/ui";

export default function AreaCheckboxDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="max-w-[420px]">
			<AreaCheckbox
				title="Auto-number invoices"
				description="Give each new invoice the next number in the series, e.g. INV-2026-0143."
				checked={s}
				onCheckedChange={setS}
			/>
		</div>
	);
}
```

## Use

Opt-in settings that need explanation (rounding, auto-numbering).

## Props

`title`, `checked`, `onCheckedChange`; optional `description`, `disabled` + `disabledReason` (tooltip), `children` (shown when checked).

- `title`: `string`
- `checked?`: `boolean`
- `defaultChecked?`: `boolean`. Initial state for uncontrolled use. Default `false`.
- `onCheckedChange?`: `(checked: boolean) => void`
- `disabled?`: `boolean`. Default `false`.
- `disabledReason?`: `string`
- `hide?`: `boolean`. Default `false`.
- `description?`: `string`
- Also accepts `ComponentProps<"div">`.

Category: Components · Selection. Source: `packages/ui/src/base/components/general/area-checkbox.tsx`.
