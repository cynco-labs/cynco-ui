# Label

The one form label: a native `<label>`, with an optional required marker.

```tsx
import { Label } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Input, Label } from "@cynco-labs/ui";

export default function LabelDemo() {
	return (
		<div className="flex max-w-[280px] flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="payment-terms">Payment terms</Label>
				<Input id="payment-terms" defaultValue="Net 30" />
			</div>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="tax-number" required>
					Tax identification number
				</Label>
				<Input id="tax-number" placeholder="e.g. C25718364020" />
			</div>
		</div>
	);
}
```

## Use

Naming any control. Inside a `Field` use `FieldLabel`, which binds it to the control for you.

## Props

Children, `htmlFor` (the control's `id`) or a wrapped control, `required`, and any `<label>` props.

- `required?`: `boolean`. Marks the control as required: an asterisk for sighted readers, the word for everyone else. Default `false`.
- Also accepts `ComponentProps<"label">`.

## Notes

`required` draws an asterisk and reads "(required)" to screen readers. Disabled styling follows the control through `peer-disabled:`, so put the label next to the control it names.

Category: Components · Forms. Source: `packages/ui/src/base/components/ui/label.tsx:9-31`.
