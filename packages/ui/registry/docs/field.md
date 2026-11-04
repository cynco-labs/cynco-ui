# Field

A form field: label, description, control and error, with the ids wired between them.

```tsx
import { Field } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel, Input } from "@cynco-labs/ui";
import { useState } from "react";

export default function FieldDemo() {
	const [code, setCode] = useState("");
	const invalid = code.trim().length > 0 && !/^\d{4}$/.test(code.trim());

	return (
		<div className="flex max-w-[320px] flex-col gap-4">
			<Field invalid={invalid}>
				<FieldLabel required hint="Unique within your chart of accounts">
					Account code
				</FieldLabel>
				<FieldDescription>Four digits, e.g. 4000 for revenue.</FieldDescription>
				<FieldControl>
					<Input inputMode="numeric" placeholder="e.g. 4000" value={code} onChange={(e) => setCode(e.target.value)} />
				</FieldControl>
				{invalid && <FieldError>Enter exactly four digits.</FieldError>}
			</Field>

			<Field>
				<FieldLabel>Display name</FieldLabel>
				<FieldDescription>Printed on invoices and statements.</FieldDescription>
				<FieldControl>
					<Input placeholder="e.g. Nusantara Logistik Bhd" />
				</FieldControl>
			</Field>
		</div>
	);
}
```

## Use

Every labelled control. It replaces hand-wiring `htmlFor`, `aria-describedby` and `aria-invalid` on each field.

## Props

`Field` (optional `invalid`) around `FieldLabel` (optional `required`, `hint`), `FieldDescription`, `FieldControl` wrapping the control, and `FieldError` while `invalid`.

- `invalid?`: `boolean`. Default `false`.
- Also accepts `ComponentProps<"div">`.

## Accessibility

FieldLabel is a native label bound to the control by id, so clicking it focuses the control and the control is named by it. FieldDescription and, while the field is invalid, FieldError are pointed at by the control's aria-describedby, and the control carries aria-invalid. `required` adds an sr-only "(required)" beside the asterisk. The `hint` tooltip is a real button, so keyboard focus opens it and Escape closes it.

## Notes

`FieldControl` is what hands the control its `id`, `aria-describedby` and `aria-invalid`, so the wiring cannot be forgotten. The description and the `hint` tooltip render outside the `<label>`, so the control's accessible name stays the label text. `FieldError` pairs a warning glyph with the words, so the error never rests on colour.

Category: Components · Forms. Source: `packages/ui/src/base/components/ui/field.tsx:26-56`.
