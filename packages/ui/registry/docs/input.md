# Input

The single-line text input: 28px, `interactive-secondary` fill, `input` border.

```tsx
import { Input } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Input } from "@cynco-labs/ui";

export default function InputDemo() {
	return (
		<div className="grid grid-cols-2 gap-3 max-w-[520px]">
			<Input placeholder="e.g. Office supplies" />
			<Input defaultValue="INV-2026-0142" />
			<Input variant="destructive" defaultValue="INV 2026 0142" />
			<Input disabled placeholder="Disabled" />
		</div>
	);
}
```

## Use

Every text field. Use `variant="destructive"` for validation errors, `headless` inside composite fields.

## Props

Native input props, `variant`.

## Notes

Built on the form layers: `input-base` + `input-shadow-default` + `input-state-focus` (see Forms). Focus darkens the border and adds a soft 3px ring, never a coloured outline.

Category: Components · Inputs. Source: `packages/ui/src/base/components/ui/input.tsx`.
