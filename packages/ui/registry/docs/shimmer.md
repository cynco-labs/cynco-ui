# Shimmer

Text with a moving shimmer.

```tsx
import { Shimmer } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Shimmer } from "@cynco-labs/ui/ai";

export default function ShimmerDemo() {
	return <Shimmer>Preparing your trial balance…</Shimmer>;
}
```

## Use

Short "working" labels while streaming.

## Props

String children; `duration`, `spread`, `as`.

- `children`: `string`
- `as?`: `ElementType`. Default `"p"`.
- `duration?`: `number`. Default `2`.
- `spread?`: `number`. Default `2`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/shimmer.tsx`.
