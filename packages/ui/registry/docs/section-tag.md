# SectionTag

A muted uppercase-free tag that labels a section.

```tsx
import { SectionTag } from "@cynco-labs/ui";
```

## Usage

```tsx
import { SectionTag } from "@cynco-labs/ui";

export default function SectionTagDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<SectionTag>Line items</SectionTag>
			<SectionTag>Payment</SectionTag>
		</div>
	);
}
```

## Use

Section headings inside sheets and editors.

## Props

Children.

- `children`: `ReactNode`

Category: Components · Data display. Source: `packages/ui/src/base/components/general/section-tag.tsx`.
