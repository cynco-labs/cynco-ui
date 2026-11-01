# ButtonGroup

Joins adjacent buttons, inputs or selects into one segmented control.

```tsx
import { ButtonGroup } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Button, ButtonGroup } from "@cynco-labs/ui";

export default function ButtonGroupDemo() {
	return (
		<ButtonGroup>
			<Button variant="secondary">Day</Button>
			<Button variant="secondary">Week</Button>
			<Button variant="secondary">Month</Button>
		</ButtonGroup>
	);
}
```

## Use

Segmented choices that act as one unit (date ranges, split buttons).

## Props

Buttons/inputs as children; `orientation` horizontal (default) or vertical. `ButtonGroupText` and `ButtonGroupSeparator` for labels and dividers.

## Notes

Inner radii and duplicate borders are removed automatically.

Category: Components · Actions. Source: `packages/ui/src/base/components/ui/button-group.tsx`.
