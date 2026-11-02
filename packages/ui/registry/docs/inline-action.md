# InlineAction

A text-link-style action with an optional small icon.

```tsx
import { InlineAction } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import { InlineAction } from "@cynco-labs/ui";

export default function InlineActionDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<InlineAction icon={<PlusIcon size={12} weight="bold" />}>Add line</InlineAction>
			<InlineAction icon={<PencilSimpleIcon size={12} />}>Edit</InlineAction>
		</div>
	);
}
```

## Use

"Add line", "Edit" links inside forms and sheets where a full button is too heavy.

## Props

Button attributes plus `icon`; children is the label.

- `icon?`: `ReactNode`
- Also accepts `ComponentProps<"button">`.

## Notes

Text in `tertiary-foreground`, `primary` on hover.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/inline-action.tsx`.
