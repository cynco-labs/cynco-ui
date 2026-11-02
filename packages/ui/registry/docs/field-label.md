# FieldLabel

A field label (a native `<label>`) with optional description and info tooltip.

```tsx
import { FieldLabel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { FieldLabel, Input } from "@cynco-labs/ui";

export default function FieldLabelDemo() {
	return (
		<div className="flex flex-col gap-3 max-w-[320px]">
			<div>
				<FieldLabel htmlFor="field-label-code" tooltip="Unique within your chart of accounts">
					Account code
				</FieldLabel>
				<Input id="field-label-code" placeholder="e.g. 4000" />
			</div>
			<div>
				<FieldLabel
					htmlFor="field-label-name"
					description="Optional"
					descriptionId="field-label-name-hint"
				>
					Display name
				</FieldLabel>
				<Input id="field-label-name" aria-describedby="field-label-name-hint" />
			</div>
		</div>
	);
}
```

## Use

Fields that need a hint.

## Props

Children, `htmlFor` (the control's `id`), optional `description` + `descriptionId`, `tooltip`, `empty`, and any `<label>` props.

- `description?`: `string`. Hint under the label. Rendered outside the `<label>`, so it never joins the control's name.
- `descriptionId?`: `string`. Id for the description, so the control can point `aria-describedby` at it.
- `empty?`: `boolean`. Render an aria-hidden spacer the height of a label, to align fields that have none. Default `false`.
- `tooltip?`: `string`. Info tooltip beside the description (or the label, without one). Kept outside the `<label>`.
- Also accepts `ComponentProps<"label">`.

## Notes

The description and tooltip render outside the `<label>`, so the control's name is just the label text; point the control's `aria-describedby` at `descriptionId` to read the hint with it. With a description or tooltip, `className` goes on the wrapper and `<label>` props on the label. `empty` renders an aria-hidden spacer.

Category: Components · Forms. Source: `packages/ui/src/base/components/general/field-label.tsx`.
