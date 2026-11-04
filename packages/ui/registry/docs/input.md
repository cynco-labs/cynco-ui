# Input

The single-line text input: 28px, `interactive-secondary` fill, `input` border.

```tsx
import { Input } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Input, Label } from "@cynco-labs/ui";

export default function InputDemo() {
	return (
		<div className="grid grid-cols-2 gap-3 max-w-[520px]">
			<Label className="flex-col items-start gap-1.5">
				Description
				<Input placeholder="e.g. Office supplies" />
			</Label>
			<Label className="flex-col items-start gap-1.5">
				Invoice number
				<Input defaultValue="INV-2026-0142" />
			</Label>
			<Label className="flex-col items-start gap-1.5">
				Reference
				<Input variant="destructive" defaultValue="INV 2026 0142" aria-invalid />
			</Label>
			<Label className="flex-col items-start gap-1.5">
				Locked field
				<Input disabled placeholder="Disabled" />
			</Label>
		</div>
	);
}
```

## Use

Every text field. Use `variant="destructive"` for validation errors, `headless` inside composite fields.

## Props

Native input props, `variant`.

- `variant?`: `"default" | "destructive" | "headless"`. Default `"default"`.
- Also accepts `ComponentProps<"input">`.

## Notes

Built on the shared input surface (border, radius, placeholder colour and focus treatment are the same ones SelectTrigger and Textarea use). Focus darkens the border and adds a soft 3px ring, never a coloured outline.

Category: Components · Inputs. Source: `packages/ui/src/base/components/ui/input.tsx:41-50`.
