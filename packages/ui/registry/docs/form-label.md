# FormLabel

The standard field label in `text-form-label`, dimmed when disabled.

```tsx
import { FormLabel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { FormLabel } from "@cynco-labs/ui";

export default function FormLabelDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<FormLabel>Unit price</FormLabel>
			<FormLabel disabled>Disabled label</FormLabel>
		</div>
	);
}
```

## Use

Above inputs in sheets.

## Props

Children, `disabled`.

Category: Components · Forms. Source: `packages/ui/src/base/components/general/form-label.tsx`.
