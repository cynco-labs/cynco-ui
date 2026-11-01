# Skeleton

A pulsing `muted` placeholder block.

```tsx
import { Skeleton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Skeleton } from "@cynco-labs/ui";

export default function SkeletonDemo() {
	return (
		<div className="flex flex-col gap-2 max-w-[320px]">
			<Skeleton className="h-4 w-3/4" />
			<Skeleton className="h-4 w-1/2" />
			<Skeleton className="h-8 w-full" />
		</div>
	);
}
```

## Use

Loading states shaped like the content.

## Props

Sizing classes.

Category: Components · Feedback. Source: `packages/ui/src/base/components/ui/skeleton.tsx`.
