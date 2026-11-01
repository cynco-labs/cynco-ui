# FieldLabel

A field label with optional description and info tooltip.

```tsx
import { FieldLabel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { FieldLabel } from "@cynco-labs/ui";

export default function FieldLabelDemo() {
	return (
		<div className="flex flex-col gap-3">
			<FieldLabel tooltip="Unique within your chart of accounts">Account code</FieldLabel>
			<FieldLabel description="Optional">Display name</FieldLabel>
		</div>
	);
}
```

## Use

Fields that need a hint.

## Props

Children, optional `description`, `tooltip`, `empty`.

Category: Components · Forms. Source: `packages/ui/src/base/components/general/field-label.tsx`.
