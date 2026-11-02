# TextCheckbox

A Checkbox with a clickable text label.

```tsx
import { TextCheckbox } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { TextCheckbox } from "@cynco-labs/ui";

export default function TextCheckboxDemo() {
	const [s, setS] = useState(true);
	return (
		<TextCheckbox checked={s} onCheckedChange={setS}>
			Round totals to the nearest 5 sen
		</TextCheckbox>
	);
}
```

## Use

Single options in forms.

## Props

Checkbox props and the label as children.

- `children`: `ReactNode`
- `size?`: `"sm" | "md" | "lg"`
- `disabled?`: `boolean`. Whether the component should ignore user interaction. Default `false`.
- Also accepts `CheckboxPrimitive.Root.Props`.

## Notes

Label uses `text-checkbox-label`; disabled uses `text-checkbox-disabled`.

Category: Components · Selection. Source: `packages/ui/src/base/components/general/text-checkbox.tsx`.
