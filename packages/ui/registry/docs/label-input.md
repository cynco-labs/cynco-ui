# LabelInput

A labelled Input with an optional description line above it.

```tsx
import { LabelInput } from "@cynco-labs/ui";
```

## Usage

```tsx
import { LabelInput } from "@cynco-labs/ui";

export default function LabelInputDemo() {
	return (
		<div className="max-w-[320px]">
			<LabelInput
				label="Customer name"
				placeholder="e.g. Pro"
				description="Printed on invoices and statements."
			/>
		</div>
	);
}
```

## Use

Most form fields in sheets: name, IDs, URLs.

## Props

`label`, `placeholder` (required), optional `description`, input props.

- `label`: `string | ReactElement<typeof HTMLSpanElement>`
- `placeholder`: `string`
- `description?`: `string`
- Also accepts `ComponentProps<"input">`.

## Notes

Label uses `text-form-label`; description `text-body-secondary`.

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/label-input.tsx`.
