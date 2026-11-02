# FormLabel

The standard field label (a native `<label>`) in `text-form-label`, dimmed when disabled.

```tsx
import { FormLabel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { FormLabel, Input } from "@cynco-labs/ui";

export default function FormLabelDemo() {
	return (
		<div className="grid grid-cols-2 gap-3 max-w-[520px]">
			<div>
				<FormLabel htmlFor="form-label-price">Unit price</FormLabel>
				<Input id="form-label-price" inputMode="decimal" defaultValue="120.00" />
			</div>
			<div>
				<FormLabel htmlFor="form-label-locked" disabled>
					Disabled label
				</FormLabel>
				<Input id="form-label-locked" disabled placeholder="Locked" />
			</div>
		</div>
	);
}
```

## Use

Above inputs in sheets.

## Props

Children, `htmlFor` (the control's `id`) or a wrapped control, `disabled`, and any `<label>` props.

- `disabled?`: `boolean`. Dims the label to match a disabled control.
- Also accepts `ComponentProps<"label">`.

## Notes

Pair `disabled` with the control's own `disabled`; the label only dims.

Category: Components · Forms. Source: `packages/ui/src/base/components/general/form-label.tsx`.
