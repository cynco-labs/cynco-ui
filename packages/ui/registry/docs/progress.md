# Progress

A thin progress bar, `primary` on a muted track.

```tsx
import { Progress } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Progress } from "@cynco-labs/ui";

export default function ProgressDemo() {
	return (
		<div className="max-w-[360px]">
			<Progress value={64} aria-label="Import progress" />
		</div>
	);
}
```

## Use

Progress against a target, setup progress, import progress.

## Props

`value` 0–100; optional `ProgressLabel`, `ProgressValue` children.

Category: Components · Feedback. Source: `packages/ui/src/base/components/ui/progress.tsx`.
