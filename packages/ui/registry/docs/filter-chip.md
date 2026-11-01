# FilterChip

An active filter shown as `label value ×`.

```tsx
import { FilterChip } from "@cynco-labs/ui";
```

## Usage

```tsx
import { FilterChip } from "@cynco-labs/ui";

export default function FilterChipDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<FilterChip label="Status" value="Overdue" onRemove={() => {}} />
			<FilterChip label="Status" value="Active" onRemove={() => {}} />
		</div>
	);
}
```

## Use

Inside search bars and toolbars to show applied filters.

## Props

`label`, `value`, `onRemove`.

Category: Components · Data display. Source: `packages/ui/src/base/components/general/filter-chip.tsx`.
