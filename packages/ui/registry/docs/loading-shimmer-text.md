# LoadingShimmerText

A line of text with a moving shimmer and spinner.

```tsx
import { LoadingShimmerText } from "@cynco-labs/ui";
```

## Usage

```tsx
import { LoadingShimmerText } from "@cynco-labs/ui";

export default function LoadingShimmerTextDemo() {
	return <LoadingShimmerText text="Syncing bank feed…" />;
}
```

## Use

Long-running background work ("Syncing bank feed…").

## Props

`text`.

- `text`: `string`

## Notes

Uses the `.shimmer` gradient from the stylesheet.

Category: Components · Feedback. Source: `packages/ui/src/base/components/general/loading-shimmer-text.tsx`.
