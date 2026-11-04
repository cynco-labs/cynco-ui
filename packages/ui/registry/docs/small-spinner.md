# SmallSpinner

A small circular spinner.

```tsx
import { SmallSpinner } from "@cynco-labs/ui";
```

## Usage

```tsx
import { SmallSpinner } from "@cynco-labs/ui";

export default function SmallSpinnerDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<SmallSpinner size={12} />
			<SmallSpinner size={16} />
			<SmallSpinner size={20} />
		</div>
	);
}
```

## Use

Inline loading (buttons use it automatically when `isLoading`).

## Props

`size` in px.

Category: Components · Feedback. Source: `packages/ui/src/base/components/general/small-spinner.tsx:5-20`.
