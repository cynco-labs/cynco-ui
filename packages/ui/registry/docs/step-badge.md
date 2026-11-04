# StepBadge

A small numbered square for step lists.

```tsx
import { StepBadge } from "@cynco-labs/ui";
```

## Usage

```tsx
import { StepBadge } from "@cynco-labs/ui";

export default function StepBadgeDemo() {
	return (
		<div className="flex items-center gap-2 text-lg font-semibold text-foreground">
			<StepBadge>1</StepBadge>Add your first customer
		</div>
	);
}
```

## Use

Onboarding steps.

## Props

The step number as children.

Category: Components · Data display. Source: `packages/ui/src/base/components/general/step-badge.tsx:3-16`.
